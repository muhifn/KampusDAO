// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CampusSoulboundNFT.sol";

contract CampusSoulboundNFTTest is Test {
    CampusSoulboundNFT nft;

    address issuer = address(this);
    address student1 = address(0x1);
    address student2 = address(0x2);

    bytes32 constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    event PassClaimed(address indexed student, uint256 tokenId, uint256 claimedAt);
    event Locked(uint256 tokenId);
    event PassRevoked(address indexed student, uint256 tokenId);
    event WhitelistUpdated(address indexed student, bool status);

    function setUp() public {
        nft = new CampusSoulboundNFT("Campus Pass", "CPASS");
    }

    // ============== WHITELIST & CLAIM FLOW ==============

    function test_addToWhitelist() public {
        nft.addToWhitelist(student1);
        assertTrue(nft.isWhitelisted(student1));
    }

    function test_claimPass_success() public {
        nft.addToWhitelist(student1);

        vm.expectEmit(true, false, false, true, address(nft));
        emit PassClaimed(student1, 0, block.timestamp);

        vm.prank(student1);
        nft.claimPass();

        assertTrue(nft.hasPass(student1));
        assertEq(nft.balanceOf(student1), 1);
        assertEq(nft.ownerOf(0), student1);
    }

    function test_claimPass_notWhitelisted_reverts() public {
        vm.prank(student1);
        vm.expectRevert();
        nft.claimPass();
    }

    function test_claimPass_alreadyHasPass_reverts() public {
        nft.addToWhitelist(student1);

        vm.prank(student1);
        nft.claimPass();

        vm.prank(student1);
        vm.expectRevert();
        nft.claimPass();
    }

    // ============== SOULBOUND (NON-TRANSFERABLE) ==============

    function test_locked_returnsTrueForExistingToken() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        assertTrue(nft.locked(0));
    }

    function test_locked_revertsWithTokenDoesNotExist() public {
        vm.expectRevert();
        nft.locked(999);
    }

    function test_transferFrom_blocked() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        vm.prank(student1);
        vm.expectRevert(CampusSoulboundNFT.SoulboundTransferNotAllowed.selector);
        nft.transferFrom(student1, student2, 0);
    }

    function test_safeTransferFrom_blocked() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        vm.prank(student1);
        vm.expectRevert(CampusSoulboundNFT.SoulboundTransferNotAllowed.selector);
        nft.safeTransferFrom(student1, student2, 0);
    }

    function test_approve_blocked() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        vm.prank(student1);
        vm.expectRevert(CampusSoulboundNFT.SoulboundTransferNotAllowed.selector);
        nft.approve(student2, 0);
    }

    function test_setApprovalForAll_blocked() public {
        vm.prank(student1);
        vm.expectRevert(CampusSoulboundNFT.SoulboundTransferNotAllowed.selector);
        nft.setApprovalForAll(student2, true);
    }

    // ============== BURN FUNCTIONS ==============

    function test_burnPass_byOwner() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        vm.prank(student1);
        nft.burnPass();

        assertFalse(nft.hasPass(student1));
        assertEq(nft.balanceOf(student1), 0);
    }

    function test_burnPass_notOwner_reverts() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        vm.prank(student2);
        vm.expectRevert();
        nft.burnPass();
    }

    function test_revokePass_byIssuer() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        nft.revokePass(0);
        assertFalse(nft.hasPass(student1));
        assertEq(nft.balanceOf(student1), 0);
    }

    // ============== VOTING POWER ==============

    function test_votingPower_activeAfterMint() public {
        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        // ERC721Votes: 1 NFT = 1 vote unit (not 1e18)
        assertEq(nft.getVotes(student1), 1);
    }

    // ============== ACCESS CONTROL ==============

    function test_onlyIssuerCanAddToWhitelist() public {
        nft.grantRole(ISSUER_ROLE, issuer);

        vm.startPrank(student1);
        vm.expectRevert();
        nft.addToWhitelist(student2);
        vm.stopPrank();
    }

    function test_supportsInterface_ERC5192() public {
        bytes4 interfaceId = type(IERC5192).interfaceId;  // 0xb45a3c0e
        assertTrue(nft.supportsInterface(interfaceId));
    }

    function test_supportsInterface_ERC721() public {
        assertTrue(nft.supportsInterface(type(IERC721).interfaceId));
    }

    // ============== VIEW FUNCTIONS ==============

    function test_isWhitelisted_false_when_not_added() public {
        assertFalse(nft.isWhitelisted(student1));
    }

    function test_hasPass_false_when_no_pass() public {
        assertFalse(nft.hasPass(student1));
    }

    function test_totalPasses() public {
        assertEq(nft.totalPasses(), 0);

        nft.addToWhitelist(student1);
        vm.prank(student1);
        nft.claimPass();

        assertEq(nft.totalPasses(), 1);
    }
}