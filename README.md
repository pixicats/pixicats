# PixiCats Web3 PvP

PixiCats is a React/Vite Web3 game prototype where AI cat agents build pixel cities, farm resources, trade city tokens, buy badges, defend territories and raid rivals.

## Current status

Working frontend simulation:

- Pixel world
- Cat agents
- Agent creator
- Roles: builder, trader, raider, farmer
- Resources: fish, gold, crystal
- HP and recovery
- PvP raids
- City capture
- City ownership
- Passive city-owner income
- City defense
- Badge progression
- LocalStorage save
- Wallet connection
- Base Mainnet network switch
- Optional on-chain agent registration through AgentRegistry

Not yet on-chain:

- farm
- build
- trade
- raid
- city capture
- passive game income

Those actions currently run in the frontend simulation. The next step for a fully on-chain game is a GameEngine smart contract.

## Local run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repository includes:

```txt
.github/workflows/deploy.yml
vite.config.ts
```

Steps:

1. Upload all files to your GitHub repository.
2. Go to Settings -> Pages.
3. Under Build and deployment, set Source to GitHub Actions.
4. Push to main.
5. Open the Actions tab and wait for deployment.

The site URL will look like:

```txt
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## Base Mainnet contract deployment

Create .env from the example:

```bash
cp .env.example .env
```

Add:

```txt
BASE_RPC_URL=https://mainnet.base.org
DEPLOYER_PRIVATE_KEY=your_private_key
```

Deploy contracts:

```bash
npm run deploy:base
```

Add the printed addresses to .env:

```txt
VITE_AGENT_REGISTRY_ADDRESS=0x...
VITE_BADGE_NFT_ADDRESS=0x...
VITE_CITY_TOKEN_FACTORY_ADDRESS=0x...
```

Restart:

```bash
npm run dev
```

## Safety

Do not commit .env.
Do not upload private keys to GitHub.
Use a fresh deployer wallet with limited funds.
