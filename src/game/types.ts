export type TileType =
  | "grass"
  | "water"
  | "sand"
  | "road"
  | "city"
  | "forest"
  | "stone"
  | "fish"
  | "gold"
  | "crystal";

export type BuildingType =
  | "house"
  | "shop"
  | "tower"
  | "bank"
  | "park"
  | "monument"
  | "wall";

export type Mood =
  | "building"
  | "shopping"
  | "trading"
  | "traveling"
  | "resting"
  | "farming"
  | "raiding"
  | "defending";

export type CatColor = "orange" | "black" | "white" | "gray" | "purple" | "blue";
export type AgentRole = "builder" | "trader" | "raider" | "farmer";
export type ResourceType = "fish" | "gold" | "crystal";

export type Position = {
  x: number;
  y: number;
};

export type Resources = {
  fish: number;
  gold: number;
  crystal: number;
};

export type Tile = {
  x: number;
  y: number;
  type: TileType;
  cityId?: string;
  resourceAmount?: number;
};

export type Building = {
  id: string;
  cityId: string;
  type: BuildingType;
  position: Position;
  level: number;
};

export type CityToken = {
  symbol: string;
  name: string;
  supply: number;
  treasury: number;
  onchainAddress?: string;
};

export type City = {
  id: string;
  name: string;
  color: string;
  center: Position;
  token: CityToken;
  citizens: number;
  level: number;
  defense: number;
  ownerAgentId?: string;
  ownerWallet?: string;
};

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  xp: number;
  description: string;
  onchainBadgeId: number;
};

export type Agent = {
  id: string;
  name: string;
  catColor: CatColor;
  role: AgentRole;
  homeCityId: string;
  position: Position;
  target: Position;
  wallet: Record<string, number>;
  resources: Resources;
  badges: string[];
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  cooldown: number;
  victories: number;
  defeats: number;
  passiveEarned: number;
  mood: Mood;
  log: string[];
  ownerWallet?: string;
  onchainAgentId?: string;
  creationTx?: string;
};

export type GameState = {
  tick: number;
  width: number;
  height: number;
  tiles: Tile[];
  cities: City[];
  buildings: Building[];
  agents: Agent[];
  worldLog: string[];
};
