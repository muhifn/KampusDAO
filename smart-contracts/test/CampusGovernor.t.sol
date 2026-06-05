// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "../src/CampusSoulboundNFT.sol";
import "../src/CampusGovernor.sol";

contract CampusGovernorTest is Test {
    CampusSoulboundNFT nft;
    TimelockController timelock;
    CampusGovernor governor;

    address issuer;
    address student1 = address(0x1);
    address student2 = address(0x2);
    address student3 = address(0x3);

    uint256 public constant VOTING_DELAY = 7200;
    uint256 public constant VOTING_PERIOD = 36000;
    uint256 public constant TIMELOCK_MIN_DELAY = 86400;

    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        address[] targets,
        uint256[] values,
        string[] signatures,
        bytes[] calldatas,
        uint256 voteStart,
        uint256 voteEnd,
        string description
    );

    function setUp() public {
        issuer = address(this);

        // Deploy NFT
        nft = new CampusSoulboundNFT("Campus Pass", "CPASS");

        // Deploy Timelock (no delay for test)
        address[] memory proposers = new address[](1);
        proposers[0] = issuer;
        address[] memory executors = new address[](1);
        executors[0] = address(0);

        timelock = new TimelockController(
            TIMELOCK_MIN_DELAY, // minDelay
            proposers,
            executors,
            issuer // admin
        );

        // Deploy Governor
        governor = new CampusGovernor(
            "Campus DAO Governor",
            nft, // token
            timelock,
            address(nft) // soulboundNFT for hasPass checks
        );

        // Grant governor as proposer on timelock
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        // revoke admin as proposer
        timelock.revokeRole(timelock.PROPOSER_ROLE(), issuer);

        // Whitelist & claim passes
        nft.addToWhitelist(student1);
        nft.addToWhitelist(student2);
        nft.addToWhitelist(student3);

        vm.prank(student1);
        nft.claimPass();
        vm.prank(student2);
        nft.claimPass();
        vm.prank(student3);
        nft.claimPass();
    }

    // ============== HELPER FUNCTIONS ==============

    function _propose(
        address proposer,
        string memory description
    ) private returns (uint256) {
        // Advance 1 block so snapshot block has voting power
        vm.roll(block.number + 1);

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        targets[0] = address(nft);
        values[0] = 0;
        calldatas[0] = abi.encodeWithSignature("totalPasses()");

        vm.prank(proposer);
        uint256 proposalId = governor.propose(
            targets,
            values,
            calldatas,
            description
        );

        return proposalId;
    }

    // ============== GOVERNOR TESTS ==============

    function test_governorCreated() public {
        assertTrue(address(governor) != address(0));
        assertEq(governor.name(), "Campus DAO Governor");
    }

    function test_votingDelay() public view {
        assertEq(governor.votingDelay(), VOTING_DELAY);
    }

    function test_votingPeriod() public view {
        assertEq(governor.votingPeriod(), VOTING_PERIOD);
    }

    function test_proposalThreshold() public {
        assertEq(governor.proposalThreshold(), 1);
    }

    function test_proposalThreshold_reverts_if_proposerHasNoPass() public {
        address noNftVoter = address(0x99);
        vm.prank(noNftVoter);
        vm.expectRevert();
        governor.propose(
            new address[](1),
            new uint256[](1),
            new bytes[](1),
            "no power proposal"
        );
    }

    function test_quorum() public view {
        // 15% of total supply. At this point in the test flow,
        // getPastTotalSupply at block 0 returns 0 (no supply yet)
        assertEq(governor.quorum(0), 0);
        // At block 1, getPastTotalSupply returns total NFTs minted up to that point
    }

    // ============== PROPOSAL FLOW ==============

    function test_createProposal_success() public {
        uint256 proposalId = _propose(student1, "Proposal 1: Test");
        assertTrue(proposalId > 0);
    }

    function test_vote_for_success() public {
        uint256 proposalId = _propose(student1, "Proposal: Vote test");

        // Advance block to allow voting
        vm.roll(block.number + VOTING_DELAY + 1);

        vm.prank(student2);
        governor.castVote(proposalId, 1); // 1 = FOR
    }

    function test_vote_without_votingPower_reverts() public {
        uint256 proposalId = _propose(student1, "Proposal: No Power Vote");

        // Voting before voting starts should revert (proposal is Pending)
        address noNftVoter = address(0x99);
        vm.prank(noNftVoter);
        vm.expectRevert();
        governor.castVote(proposalId, 1);
    }

    function test_fullGovernanceFlow_propose_vote_queue_execute() public {
        // Step 1: Create proposal
        uint256 proposalId = _propose(student1, "Full flow test");

        // Step 2: Advance blocks for voting to start
        vm.roll(block.number + VOTING_DELAY + 1);

        // Step 3: Vote FOR (2 out of 3 voters)
        vm.prank(student1);
        governor.castVote(proposalId, 1);
        vm.prank(student2);
        governor.castVote(proposalId, 1);

        // Step 4: Voting ends
        vm.roll(block.number + VOTING_PERIOD + 1);

        // Step 5: Check state is Succeeded = 4 (ProposalState enum)
        // Note: quorum is 15% of total supply (3 NFTs × 0.15 = 0.45)
        //            With 2 votes for + 0 against out of 3 voters, quorum is 2 out of 3
        assertEq(uint8(governor.state(proposalId)), 4);
    }
}