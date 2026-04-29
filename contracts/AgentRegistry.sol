// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentRegistry {
    struct Agent {
        address owner;
        string name;
        string catColor;
        string metadataURI;
        uint256 createdAt;
        bool exists;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => Agent) public agents;
    mapping(address => uint256[]) private ownerAgents;

    event AgentCreated(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        string catColor,
        string metadataURI
    );

    function createAgent(
        string calldata name,
        string calldata catColor,
        string calldata metadataURI
    ) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "NAME_REQUIRED");
        require(bytes(catColor).length > 0, "COLOR_REQUIRED");

        agentId = nextAgentId;
        nextAgentId += 1;

        agents[agentId] = Agent({
            owner: msg.sender,
            name: name,
            catColor: catColor,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            exists: true
        });

        ownerAgents[msg.sender].push(agentId);

        emit AgentCreated(agentId, msg.sender, name, catColor, metadataURI);
    }

    function getOwnerAgents(address owner) external view returns (uint256[] memory) {
        return ownerAgents[owner];
    }
}
