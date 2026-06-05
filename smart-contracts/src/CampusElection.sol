// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ICampusSoulboundNFT {
    function hasPass(address student) external view returns (bool);
}

contract CampusElection is AccessControl, ReentrancyGuard {
    using Strings for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    ICampusSoulboundNFT public immutable soulboundNFT;

    struct Election {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool exists;
        bool isFinalized;
    }

    struct Candidate {
        string name;
        string description;
        uint256 voteCount;
        bool exists;
    }

    uint256 public nextElectionId = 1;

    // electionId => Election
    mapping(uint256 => Election) public elections;

    // electionId => candidateIndex => Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;

    // electionId => candidateCount
    mapping(uint256 => uint256) public candidateCount;

    // electionId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // electionId => voter => votedCandidateIndex
    mapping(uint256 => mapping(address => uint256)) public voterChoice;

    error ElectionNotExists();
    error ElectionAlreadyStarted();
    error ElectionNotActive();
    error ElectionNotEnded();
    error ElectionAlreadyFinalized();
    error NoCampusPass();
    error AlreadyVoted();
    error InvalidCandidate();
    error NoCandidates();
    error InvalidTime();

    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event CandidateAdded(
        uint256 indexed electionId,
        uint256 candidateIndex,
        string name
    );

    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        uint256 candidateIndex
    );

    event ElectionFinalized(uint256 indexed electionId);

    constructor(address _soulboundNFT) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        soulboundNFT = ICampusSoulboundNFT(_soulboundNFT);
    }

    function createElection(
        string calldata title,
        string calldata description,
        uint256 startTime,
        uint256 endTime
    ) external onlyRole(ADMIN_ROLE) {
        if (startTime >= endTime) revert InvalidTime();
        if (startTime < block.timestamp) revert InvalidTime();

        uint256 electionId = nextElectionId++;
        elections[electionId] = Election({
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            exists: true,
            isFinalized: false
        });

        emit ElectionCreated(electionId, title, startTime, endTime);
    }

    function addCandidate(
        uint256 electionId,
        string calldata name,
        string calldata description
    ) external onlyRole(ADMIN_ROLE) {
        if (!elections[electionId].exists) revert ElectionNotExists();
        if (block.timestamp >= elections[electionId].startTime) revert ElectionAlreadyStarted();

        uint256 index = candidateCount[electionId];
        candidates[electionId][index] = Candidate({
            name: name,
            description: description,
            voteCount: 0,
            exists: true
        });
        candidateCount[electionId] = index + 1;

        emit CandidateAdded(electionId, index, name);
    }

    function vote(
        uint256 electionId,
        uint256 candidateIndex
    ) external nonReentrant {
        if (!elections[electionId].exists) revert ElectionNotExists();
        if (block.timestamp < elections[electionId].startTime) revert ElectionNotActive();
        if (block.timestamp > elections[electionId].endTime) revert ElectionNotActive();
        if (!soulboundNFT.hasPass(msg.sender)) revert NoCampusPass();
        if (hasVoted[electionId][msg.sender]) revert AlreadyVoted();
        if (candidateIndex >= candidateCount[electionId]) revert InvalidCandidate();

        hasVoted[electionId][msg.sender] = true;
        voterChoice[electionId][msg.sender] = candidateIndex;
        candidates[electionId][candidateIndex].voteCount += 1;

        emit VoteCast(electionId, msg.sender, candidateIndex);
    }

    function getCandidateCount(uint256 electionId) external view returns (uint256) {
        return candidateCount[electionId];
    }

    function getCandidate(
        uint256 electionId,
        uint256 candidateIndex
    ) external view returns (string memory name, string memory description, uint256 voteCount) {
        if (!elections[electionId].exists) revert ElectionNotExists();
        Candidate storage c = candidates[electionId][candidateIndex];
        if (!c.exists) revert InvalidCandidate();
        return (c.name, c.description, c.voteCount);
    }

    function getResults(uint256 electionId) external view returns (
        string[] memory names,
        uint256[] memory votes
    ) {
        if (!elections[electionId].exists) revert ElectionNotExists();

        uint256 count = candidateCount[electionId];
        names = new string[](count);
        votes = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Candidate storage c = candidates[electionId][i];
            names[i] = c.name;
            votes[i] = c.voteCount;
        }
        return (names, votes);
    }

    function hasVotedInElection(
        uint256 electionId,
        address voter
    ) external view returns (bool) {
        return hasVoted[electionId][voter];
    }

    function getVoterChoice(
        uint256 electionId,
        address voter
    ) external view returns (uint256) {
        if (!hasVoted[electionId][voter]) revert();
        return voterChoice[electionId][voter];
    }

    function isElectionActive(uint256 electionId) external view returns (bool) {
        if (!elections[electionId].exists) return false;
        return block.timestamp >= elections[electionId].startTime &&
               block.timestamp <= elections[electionId].endTime;
    }

    function getElectionInfo(uint256 electionId) external view returns (
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 totalCandidates,
        bool isFinalized
    ) {
        Election storage e = elections[electionId];
        if (!e.exists) revert ElectionNotExists();
        return (
            e.title,
            e.description,
            e.startTime,
            e.endTime,
            candidateCount[electionId],
            e.isFinalized
        );
    }

    function getAllElectionIds() external view returns (uint256[] memory) {
        uint256 count = nextElectionId - 1;
        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = i + 1;
        }
        return ids;
    }
}