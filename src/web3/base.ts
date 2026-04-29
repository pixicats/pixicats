import { BrowserProvider, Contract, parseUnits } from "ethers";
import { AGENT_REGISTRY_ABI, CITY_TOKEN_FACTORY_ABI } from "./abis";

export const BASE_MAINNET = {
  chainId: "0x2105",
  chainIdDecimal: 8453,
  chainName: "Base",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"]
};

export const getEthereum = () => {
  if (!window.ethereum) {
    throw new Error("Wallet not found. Install MetaMask, Coinbase Wallet or another EVM wallet.");
  }

  return window.ethereum;
};

export const connectWallet = async () => {
  const ethereum = getEthereum();
  const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
  await switchToBase();
  return accounts[0];
};

export const getChainId = async () => {
  const ethereum = getEthereum();
  return await ethereum.request({ method: "eth_chainId" }) as string;
};

export const switchToBase = async () => {
  const ethereum = getEthereum();

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_MAINNET.chainId }]
    });
  } catch (error) {
    const switchError = error as { code?: number };

    if (switchError.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BASE_MAINNET]
      });
      return;
    }

    throw error;
  }
};

export const createOnchainAgent = async (
  name: string,
  catColor: string,
  metadataURI: string
) => {
  const registryAddress = import.meta.env.VITE_AGENT_REGISTRY_ADDRESS as string | undefined;

  if (!registryAddress) {
    throw new Error("VITE_AGENT_REGISTRY_ADDRESS is missing. Deploy AgentRegistry first and add the address to .env.");
  }

  const provider = new BrowserProvider(getEthereum());
  const signer = await provider.getSigner();
  const contract = new Contract(registryAddress, AGENT_REGISTRY_ABI, signer);
  const tx = await contract.createAgent(name, catColor, metadataURI);
  const receipt = await tx.wait();

  return {
    hash: tx.hash as string,
    receipt
  };
};

export const createOnchainCityToken = async (
  cityName: string,
  tokenName: string,
  tokenSymbol: string,
  initialSupply: string
) => {
  const factoryAddress = import.meta.env.VITE_CITY_TOKEN_FACTORY_ADDRESS as string | undefined;

  if (!factoryAddress) {
    throw new Error("VITE_CITY_TOKEN_FACTORY_ADDRESS is missing. Deploy CityTokenFactory first and add the address to .env.");
  }

  const provider = new BrowserProvider(getEthereum());
  const signer = await provider.getSigner();
  const contract = new Contract(factoryAddress, CITY_TOKEN_FACTORY_ABI, signer);
  const supply = parseUnits(initialSupply, 18);
  const tx = await contract.createCityToken(cityName, tokenName, tokenSymbol, supply);
  const receipt = await tx.wait();

  return {
    hash: tx.hash as string,
    receipt
  };
};
