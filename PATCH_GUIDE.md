# PixiCats Web3 PvP React Patch

This ZIP is made for your existing React/Vite PixiCats GitHub repository.

## What this patch adds

- Pixel world
- Cat agents
- Agent creator
- Wallet connection
- Base Mainnet switch
- Optional on-chain agent creation
- Agent roles: builder, trader, raider, farmer
- Resources: fish, gold, crystal
- HP and recovery
- PvP raids
- City capture
- City owner
- Passive income for city owner
- City defense
- Badge progression
- Smart contracts:
  - AgentRegistry
  - PixiBadges
  - CityTokenFactory

## How to apply

Copy these files into your existing repo and allow overwrite when GitHub asks.

Replace:

```txt
package.json
src/App.tsx
src/styles.css
src/components/AgentCreator.tsx
src/components/PixelWorld.tsx
src/game/types.ts
src/game/badges.ts
src/game/createWorld.ts
src/game/engine.ts
src/web3/abis.ts
src/web3/base.ts
src/vite-env.d.ts
```

Add:

```txt
contracts/AgentRegistry.sol
contracts/PixiBadges.sol
contracts/CityTokenFactory.sol
scripts/deploy.ts
hardhat.config.ts
.env.example
```

Keep your existing:

```txt
index.html
src/main.tsx
tsconfig.json
.gitignore
```

If your old `src/main.tsx` imports `./App` and `./styles.css`, you do not need to change it.

## Run locally

```bash
npm install
npm run dev
```

## Build check

```bash
npm run build
```

## Deploy contracts to Base Mainnet

```bash
cp .env.example .env
```

Add your deployer private key to `.env`, then:

```bash
npm run deploy:base
```

After deploy, add contract addresses to `.env`:

```txt
VITE_AGENT_REGISTRY_ADDRESS=0x...
VITE_BADGE_NFT_ADDRESS=0x...
VITE_CITY_TOKEN_FACTORY_ADDRESS=0x...
```

Restart:

```bash
npm run dev
```

## Honest status

Local game logic works inside the frontend.

On-chain part currently registers the agent in `AgentRegistry`.
The gameplay actions like raid, farm, build and city capture are still frontend simulation.
To make every action on-chain, the next step is a full GameEngine smart contract.
