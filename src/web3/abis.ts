export const AGENT_REGISTRY_ABI = [
  "function createAgent(string name,string catColor,string metadataURI) external returns (uint256)",
  "function getOwnerAgents(address owner) external view returns (uint256[] memory)",
  "event AgentCreated(uint256 indexed agentId,address indexed owner,string name,string catColor,string metadataURI)"
];

export const BADGE_NFT_ABI = [
  "function mintBadge(uint256 badgeId,uint256 amount) external payable",
  "function badgePrices(uint256 badgeId) external view returns (uint256)"
];

export const CITY_TOKEN_FACTORY_ABI = [
  "function createCityToken(string cityName,string tokenName,string tokenSymbol,uint256 initialSupply) external returns (address)",
  "event CityTokenCreated(address indexed token,address indexed owner,string cityName,string tokenName,string tokenSymbol)"
];
