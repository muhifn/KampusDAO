// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {GovernorTimelockControl} from "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

interface ICampusSoulboundNFT {
    function hasPass(address student) external view returns (bool);
}

contract CampusGovernor is
    Governor,
    GovernorVotes,
    GovernorCountingSimple,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    uint256 public constant VOTING_DELAY_SEC = 1 days;
    uint256 public constant VOTING_PERIOD_SEC = 5 days;
    uint256 public constant TIMELOCK_DELAY = 1 days;
    uint256 public constant QUORUM_PERCENT = 15;

    ICampusSoulboundNFT public soulboundNFT;

    error NoCampusPass();

    constructor(
        string memory name,
        IVotes _token,
        TimelockController _timelock,
        address _soulboundNFT
    )
        Governor(name)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(QUORUM_PERCENT)
        GovernorTimelockControl(_timelock)
    {
        soulboundNFT = ICampusSoulboundNFT(_soulboundNFT);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor) returns (uint256) {
        if (!soulboundNFT.hasPass(msg.sender)) revert NoCampusPass();
        return super.propose(targets, values, calldatas, description);
    }

    function castVote(
        uint256 proposalId,
        uint8 support
    ) public override(Governor) returns (uint256) {
        if (!soulboundNFT.hasPass(msg.sender)) revert NoCampusPass();
        return super.castVote(proposalId, support);
    }

    function castVoteWithReason(
        uint256 proposalId,
        uint8 support,
        string calldata reason
    ) public override(Governor) returns (uint256) {
        if (!soulboundNFT.hasPass(msg.sender)) revert NoCampusPass();
        return super.castVoteWithReason(proposalId, support, reason);
    }

    function castVoteWithReasonAndParams(
        uint256 proposalId,
        uint8 support,
        string calldata reason,
        bytes memory params
    ) public override(Governor) returns (uint256) {
        if (!soulboundNFT.hasPass(msg.sender)) revert NoCampusPass();
        return super.castVoteWithReasonAndParams(proposalId, support, reason, params);
    }

    function castVoteBySig(
        uint256 proposalId,
        uint8 support,
        address voter,
        bytes memory signature
    ) public override(Governor) returns (uint256) {
        if (!soulboundNFT.hasPass(voter)) revert NoCampusPass();
        return super.castVoteBySig(proposalId, support, voter, signature);
    }

    function castVoteWithReasonAndParamsBySig(
        uint256 proposalId,
        uint8 support,
        address voter,
        string calldata reason,
        bytes memory params,
        bytes memory signature
    ) public override(Governor) returns (uint256) {
        if (!soulboundNFT.hasPass(voter)) revert NoCampusPass();
        return super.castVoteWithReasonAndParamsBySig(proposalId, support, voter, reason, params, signature);
    }

    function votingDelay() public view override returns (uint256) {
        return 1; // 1 block (~12 detik) - instan untuk demo hackathon
    }

    function votingPeriod() public view override returns (uint256) {
        return 300; // 300 blocks (~1 jam) - cukup untuk demo
    }

    function proposalThreshold() public pure override returns (uint256) {
        return 1; // ERC721Votes: 1 NFT = 1 vote unit
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }
}