// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "../src/CampusGovernor.sol";
import "../src/CampusSoulboundNFT.sol";

// Redeploy Timelock + Governor only.
// Reuse existing CampusSoulboundNFT at 0x9Fa19CD9D9a8c8CFE7030384aE42bF3E2b58b10F
contract DeployFix is Script {
    address constant NFT = 0x9Fa19CD9D9a8c8CFE7030384aE42bF3E2b58b10F;
    bytes32 constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        // ======================== 1. TimelockController ========================
        address[] memory proposers = new address[](1);
        proposers[0] = vm.addr(pk);

        address[] memory executors = new address[](1);
        executors[0] = address(0);

        vm.startBroadcast(pk);
        TimelockController timelock = new TimelockController(
            60, proposers, executors, vm.addr(pk)
        );
        vm.stopBroadcast();
        console.log("TimelockController deployed at:", address(timelock));

        // ======================== 2. CampusGovernor ========================
        vm.startBroadcast(pk);
        CampusGovernor governor = new CampusGovernor(
            "Campus DAO Governor",
            CampusSoulboundNFT(NFT),
            timelock,
            NFT
        );
        vm.stopBroadcast();
        console.log("CampusGovernor deployed at:", address(governor));

        // ======================== 3. Setup Roles ========================
        vm.startBroadcast(pk);
        timelock.grantRole(PROPOSER_ROLE, address(governor));
        timelock.revokeRole(PROPOSER_ROLE, vm.addr(pk));
        vm.stopBroadcast();

        console.log("\n========== RENEW DEPLOYMENT ==========");
        console.log("NFT (unchanged):   ", NFT);
        console.log("TimelockController:", address(timelock));
        console.log("Governor:          ", address(governor));
        console.log("=======================================");
    }
}
