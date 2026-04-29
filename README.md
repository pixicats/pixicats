# PixiCats Base Mainnet

PixiCats is a playable pixel-world game prototype where cat agents build cities, use city tokens, buy badges and level up.

This version adds:

- wallet connection
- Base Mainnet switch
- create/connect your own agent
- optional on-chain agent registration
- smart contracts for:
  - AgentRegistry
  - ERC1155 PixiBadges
  - CityTokenFactory
- pixel map with colorful cities, cats, roads, water, trees and buildings

## Run game locally

```bash
npm install
npm run dev
```

The game works immediately in local mode.

## Base Mainnet facts

Base Mainnet chain ID is `8453`.
The frontend uses:

```txt
chainId: 0x2105
RPC: https://mainnet.base.org
Explorer: https://basescan.org
Native token: ETH
```

## Create local agent

1. Run the app.
2. Click `Connect wallet`.
3. Choose name, cat color and home city.
4. Click `Create local agent`.

This adds your own cat agent to the world immediately.

## Create agent on Base Mainnet

First deploy contracts:

```bash
cp .env.example .env
```

Add your deployer private key:

```txt
DEPLOYER_PRIVATE_KEY=your_private_key_without_0x_or_with_0x
BASE_RPC_URL=https://mainnet.base.org
```

Deploy:

```bash
npm run deploy:base
```

After deploy, the terminal will print addresses:

```txt
AgentRegistry: 0x...
PixiBadges: 0x...
CityTokenFactory: 0x...
```

Add them to `.env`:

```txt
VITE_AGENT_REGISTRY_ADDRESS=0x...
VITE_BADGE_NFT_ADDRESS=0x...
VITE_CITY_TOKEN_FACTORY_ADDRESS=0x...
```

Restart app:

```bash
npm run dev
```

Now `Create on Base` sends a real transaction to Base Mainnet.

## Important warning

Base Mainnet uses real ETH for gas and real transactions.
Test carefully before using valuable wallets.
