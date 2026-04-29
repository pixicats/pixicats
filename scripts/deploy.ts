import { ethers } from "hardhat";

async function main() {
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();

  const PixiBadges = await ethers.getContractFactory("PixiBadges");
  const pixiBadges = await PixiBadges.deploy("ipfs://pixicats-badges/{id}.json");
  await pixiBadges.waitForDeployment();

  const CityTokenFactory = await ethers.getContractFactory("CityTokenFactory");
  const cityTokenFactory = await CityTokenFactory.deploy();
  await cityTokenFactory.waitForDeployment();

  console.log("AgentRegistry:", await agentRegistry.getAddress());
  console.log("PixiBadges:", await pixiBadges.getAddress());
  console.log("CityTokenFactory:", await cityTokenFactory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
