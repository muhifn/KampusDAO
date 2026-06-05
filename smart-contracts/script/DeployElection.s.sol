// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/CampusElection.sol";

contract DeployElection is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address soulboundNFT = vm.envAddress("SOULBOUND_NFT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);
        CampusElection election = new CampusElection(soulboundNFT);
        vm.stopBroadcast();

        console.log("CampusElection deployed at:", address(election));
        console.log("SoulboundNFT used:", soulboundNFT);
    }
}
