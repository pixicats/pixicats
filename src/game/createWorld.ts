import {
  Agent,
  AgentRole,
  Building,
  CatColor,
  City,
  GameState,
  Tile,
  TileType
} from "./types";

const WIDTH = 34;
const HEIGHT = 23;

export const makeId = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2)}`;

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const resourceTile = (x: number, y: number): TileType | null => {
  if ((x === 3 && y === 19) || (x === 6 && y === 20) || (x === 10 && y === 18)) return "fish";
  if ((x === 29 && y === 4) || (x === 28 && y === 13) || (x === 4 && y === 3)) return "gold";
  if ((x === 18 && y === 4) || (x === 30 && y === 18)) return "crystal";
  return null;
};

const baseTileType = (x: number, y: number): TileType => {
  const resource = resourceTile(x, y);
  if (resource) return resource;
  if (y > 18 && x < 10) return "water";
  if (y > 19 && x >= 10 && x < 17) return "sand";
  if ((x === 16 || x === 17) && y > 2 && y < 21) return "road";
  if ((y === 10 || y === 11) && x > 2 && x < 32) return "road";
  if ((x + y) % 17 === 0) return "forest";
  if ((x * y) % 43 === 0) return "stone";
  return "grass";
};

const createAgent = (
  id: string,
  name: string,
  catColor: CatColor,
  role: AgentRole,
  homeCityId: string,
  position: { x: number; y: number },
  wallet: Record<string, number>
): Agent => ({
  id,
  name,
  catColor,
  role,
  homeCityId,
  position,
  target: position,
  wallet,
  resources: { fish: 0, gold: 0, crystal: 0 },
  badges: [],
  xp: 0,
  level: 1,
  hp: 100,
  maxHp: 100,
  cooldown: 0,
  victories: 0,
  defeats: 0,
  passiveEarned: 0,
  mood: "resting",
  log: [`${name} entered PixiCats as a ${role}.`]
});

export const createInitialWorld = (): GameState => {
  const cities: City[] = [
    {
      id: "meowpolis",
      name: "Meowpolis",
      color: "#ffb347",
      center: { x: 7, y: 6 },
      token: { symbol: "MEOW", name: "Meowpolis Coin", supply: 1_000_000, treasury: 5000 },
      citizens: 30,
      level: 1,
      defense: 35,
      ownerAgentId: "agent-luna"
    },
    {
      id: "purrtown",
      name: "PurrTown",
      color: "#9bdbff",
      center: { x: 26, y: 6 },
      token: { symbol: "PURR", name: "PurrTown Token", supply: 1_000_000, treasury: 5000 },
      citizens: 24,
      level: 1,
      defense: 32,
      ownerAgentId: "agent-milo"
    },
    {
      id: "fishbay",
      name: "FishBay",
      color: "#b48cff",
      center: { x: 23, y: 17 },
      token: { symbol: "FISH", name: "FishBay Credits", supply: 1_000_000, treasury: 5000 },
      citizens: 42,
      level: 1,
      defense: 38,
      ownerAgentId: "agent-kiki"
    }
  ];

  const tiles: Tile[] = [];

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      let type = baseTileType(x, y);
      let cityId: string | undefined;

      for (const city of cities) {
        if (distance({ x, y }, city.center) <= 4) {
          if (!["fish", "gold", "crystal"].includes(type)) type = "city";
          cityId = city.id;
        }
      }

      tiles.push({
        x,
        y,
        type,
        cityId,
        resourceAmount: type === "fish" ? 60 : type === "gold" ? 35 : type === "crystal" ? 18 : undefined
      });
    }
  }

  const buildings: Building[] = [
    { id: makeId("building"), cityId: "meowpolis", type: "house", position: { x: 6, y: 5 }, level: 1 },
    { id: makeId("building"), cityId: "meowpolis", type: "shop", position: { x: 8, y: 6 }, level: 1 },
    { id: makeId("building"), cityId: "meowpolis", type: "wall", position: { x: 7, y: 8 }, level: 1 },
    { id: makeId("building"), cityId: "purrtown", type: "house", position: { x: 25, y: 5 }, level: 1 },
    { id: makeId("building"), cityId: "purrtown", type: "shop", position: { x: 27, y: 7 }, level: 1 },
    { id: makeId("building"), cityId: "purrtown", type: "bank", position: { x: 26, y: 6 }, level: 1 },
    { id: makeId("building"), cityId: "fishbay", type: "house", position: { x: 22, y: 16 }, level: 1 },
    { id: makeId("building"), cityId: "fishbay", type: "shop", position: { x: 24, y: 18 }, level: 1 },
    { id: makeId("building"), cityId: "fishbay", type: "monument", position: { x: 23, y: 17 }, level: 1 }
  ];

  const agents: Agent[] = [
    createAgent("agent-luna", "Luna", "orange", "builder", "meowpolis", { x: 7, y: 6 }, { MEOW: 280, PURR: 80, FISH: 60 }),
    createAgent("agent-milo", "Milo", "black", "trader", "purrtown", { x: 26, y: 6 }, { MEOW: 60, PURR: 280, FISH: 70 }),
    createAgent("agent-kiki", "Kiki", "purple", "raider", "fishbay", { x: 23, y: 17 }, { MEOW: 55, PURR: 75, FISH: 280 }),
    createAgent("agent-nova", "Nova", "blue", "farmer", "meowpolis", { x: 5, y: 7 }, { MEOW: 190, PURR: 110, FISH: 90 })
  ];

  return {
    tick: 0,
    width: WIDTH,
    height: HEIGHT,
    tiles,
    cities,
    buildings,
    agents,
    worldLog: ["PixiCats Web3 PvP economy generated."]
  };
};

export const createPlayerAgent = (
  name: string,
  catColor: CatColor,
  role: AgentRole,
  walletAddress: string | undefined,
  homeCityId: string
): Agent => {
  const cityStart: Record<string, { x: number; y: number; symbol: string }> = {
    meowpolis: { x: 7, y: 6, symbol: "MEOW" },
    purrtown: { x: 26, y: 6, symbol: "PURR" },
    fishbay: { x: 23, y: 17, symbol: "FISH" }
  };

  const start = cityStart[homeCityId] || cityStart.meowpolis;

  return {
    id: makeId("player-agent"),
    name,
    catColor,
    role,
    homeCityId,
    position: { x: start.x, y: start.y },
    target: { x: start.x, y: start.y },
    wallet: { MEOW: 120, PURR: 120, FISH: 120, [start.symbol]: 330 },
    resources: { fish: 8, gold: 2, crystal: 0 },
    badges: [],
    xp: 0,
    level: 1,
    hp: 100,
    maxHp: 100,
    cooldown: 0,
    victories: 0,
    defeats: 0,
    passiveEarned: 0,
    mood: "resting",
    log: [`${name} connected as a ${role}${walletAddress ? ` with ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ""}.`],
    ownerWallet: walletAddress
  };
};
