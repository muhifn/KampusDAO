// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "../src/CampusSoulboundNFT.sol";
import "../src/CampusGovernor.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // ======================== 1. Deploy CampusSoulboundNFT ========================
        vm.startBroadcast(deployerPrivateKey);
        CampusSoulboundNFT nft = new CampusSoulboundNFT(
            "Campus Pass",     // name
            "CPASS"            // symbol
        );
        vm.stopBroadcast();
        console.log("CampusSoulboundNFT deployed at:", address(nft));

        // ======================== 2. Deploy TimelockController ========================
        // Initial proposers: deployer proposer, later will add governor
        address[] memory initialProposers = new address[](1);
        initialProposers[0] = vm.addr(deployerPrivateKey);

        address[] memory executors = new address[](1);
        executors[0] = address(0);  // anyone can execute

        vm.startBroadcast(deployerPrivateKey);
        TimelockController timelock = new TimelockController(
            60,                 // minDelay: 60 detik (untuk hackathon demo)
            initialProposers,   // proposers
            executors,          // executors
            vm.addr(deployerPrivateKey) // admin
        );
        vm.stopBroadcast();
        console.log("TimelockController deployed at:", address(timelock));

        // ======================== 3. Deploy CampusGovernor ========================
        vm.startBroadcast(deployerPrivateKey);
        CampusGovernor governor = new CampusGovernor(
            "Campus DAO Governor",  // name
            nft,                    // IVotes token (CampusSoulboundNFT which is ERC721Votes)
            timelock,               // TimelockController
            address(nft)            // soulboundNFT address for hasPass checks
        );
        vm.stopBroadcast();
        console.log("CampusGovernor deployed at:", address(governor));

        // ======================== 4. Setup Roles ========================
        vm.startBroadcast(deployerPrivateKey);

        // Grant PROPOSER_ROLE on timelock to governor
        bytes32 PROPOSER_ROLE = timelock.PROPOSER_ROLE();
        timelock.grantRole(PROPOSER_ROLE, address(governor));

        // Revoke DEPLOYER as proposer
        address deployer = vm.addr(deployerPrivateKey);
        timelock.revokeRole(PROPOSER_ROLE, deployer);

        // ======================== 5. Log all addresses ========================
        console.log("\n========== DEPLOYMENT COMPLETE ==========");
        console.log("NFT:              ", address(nft));
        console.log("TimelockController:", address(timelock));
        console.log("Governor:         ", address(governor));
        console.log("=========================================");

        vm.stopBroadcast();
    }
}