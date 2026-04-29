import { BADGES } from "./badges";
import { Agent, Building, City, GameState, Position, ResourceType } from "./types";

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const makeId = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2)}`;
const samePosition = (a: Position, b: Position) => a.x === b.x && a.y === b.y;

const stepTowards = (current: Position, target: Position): Position => {
  if (samePosition(current, target)) return current;
  const next = { ...current };
  if (current.x !== target.x) next.x += current.x < target.x ? 1 : -1;
  else if (current.y !== target.y) next.y += current.y < target.y ? 1 : -1;
  return next;
};

const levelAgent = (agent: Agent) => {
  return Math.max(
    1,
    Math.floor((agent.xp + agent.badges.length * 45 + agent.victories * 35 + agent.resources.crystal * 20) / 130) + 1
  );
};

const levelCity = (city: City, buildings: Building[]) => {
  const cityBuildings = buildings.filter((building) => building.cityId === city.id);
  const power = cityBuildings.reduce((sum, building) => sum + building.level * 25, 0);
  return Math.max(1, Math.floor((power + city.citizens + city.defense) / 170) + 1);
};

const logAgent = (agent: Agent, entry: string) => {
  agent.log.unshift(entry);
  agent.log = agent.log.slice(0, 8);
};

const logWorld = (state: GameState, entry: string) => {
  state.worldLog.unshift(entry);
  state.worldLog = state.worldLog.slice(0, 14);
};

const roleMultiplier = (agent: Agent, role: Agent["role"]) => agent.role === role ? 1.55 : 1;

const earnToken = (agent: Agent, city: City, amount: number) => {
  agent.wallet[city.token.symbol] = (agent.wallet[city.token.symbol] || 0) + amount;
};

const spendToken = (agent: Agent, city: City, amount: number) => {
  agent.wallet[city.token.symbol] = Math.max(0, (agent.wallet[city.token.symbol] || 0) - amount);
  city.token.treasury += amount;
};

const nearestEmptyCityTile = (state: GameState, city: City): Position => {
  const occupied = new Set(state.buildings.map((building) => `${building.position.x}:${building.position.y}`));
  const tiles = state.tiles
    .filter((tile) => tile.cityId === city.id && tile.type === "city" && !occupied.has(`${tile.x}:${tile.y}`))
    .sort((a, b) => {
      const da = Math.abs(a.x - city.center.x) + Math.abs(a.y - city.center.y);
      const db = Math.abs(b.x - city.center.x) + Math.abs(b.y - city.center.y);
      return da - db;
    });

  const tile = tiles[Math.floor(Math.random() * Math.min(8, tiles.length))] || tiles[0];
  return tile ? { x: tile.x, y: tile.y } : { ...city.center };
};

const findResourceTile = (state: GameState, resource: ResourceType): Position => {
  const tiles = state.tiles.filter((tile) => tile.type === resource && (tile.resourceAmount || 0) > 0);
  if (!tiles.length) return { x: Math.floor(state.width / 2), y: Math.floor(state.height / 2) };
  const tile = randomItem(tiles);
  return { x: tile.x, y: tile.y };
};

const farmResources = (state: GameState, agent: Agent) => {
  const roll = Math.random();
  const resource: ResourceType = roll < 0.58 ? "fish" : roll < 0.88 ? "gold" : "crystal";
  const target = findResourceTile(state, resource);

  agent.target = target;

  if (!samePosition(agent.position, target)) {
    agent.mood = "traveling";
    logAgent(agent, `${agent.name} is moving toward ${resource}.`);
    return;
  }

  const tile = state.tiles.find((item) => item.x === target.x && item.y === target.y && item.type === resource);
  if (!tile || (tile.resourceAmount || 0) <= 0) {
    agent.xp += 5;
    logAgent(agent, `${agent.name} found an empty resource node.`);
    return;
  }

  const base = resource === "fish" ? 5 : resource === "gold" ? 3 : 1;
  const amount = Math.max(1, Math.floor(base * roleMultiplier(agent, "farmer")));
  const mined = Math.min(tile.resourceAmount || 0, amount);

  tile.resourceAmount = Math.max(0, (tile.resourceAmount || 0) - mined);
  agent.resources[resource] += mined;
  agent.xp += resource === "crystal" ? 38 : resource === "gold" ? 18 : 9;
  agent.mood = "farming";
  agent.cooldown = 1;
  logAgent(agent, `${agent.name} farmed ${mined} ${resource}.`);
};

const sellResources = (agent: Agent, city: City) => {
  const value = agent.resources.fish * 4 + agent.resources.gold * 15 + agent.resources.crystal * 55;
  const total = Math.floor(value * roleMultiplier(agent, "trader"));

  agent.target = { ...city.center };

  if (total <= 0) {
    earnToken(agent, city, 20);
    agent.xp += 6;
    logAgent(agent, `${agent.name} earned a small city reward.`);
    return;
  }

  agent.resources = { fish: 0, gold: 0, crystal: 0 };
  earnToken(agent, city, total);
  agent.xp += Math.floor(total / 8);
  agent.mood = "trading";
  agent.cooldown = 1;
  logAgent(agent, `${agent.name} sold resources for ${total} ${city.token.symbol}.`);
};

const buildSomething = (state: GameState, agent: Agent, city: City) => {
  const types: Building["type"][] = ["house", "shop", "tower", "bank", "park", "monument", "wall"];
  const type = randomItem(types);
  const cost =
    type === "house" ? 45 :
    type === "shop" ? 85 :
    type === "tower" ? 120 :
    type === "bank" ? 150 :
    type === "wall" ? 110 :
    65;
  const finalCost = Math.floor(cost / roleMultiplier(agent, "builder"));

  agent.target = nearestEmptyCityTile(state, city);

  if ((agent.wallet[city.token.symbol] || 0) < finalCost) {
    earnToken(agent, city, 35);
    agent.xp += 10;
    agent.mood = "resting";
    logAgent(agent, `${agent.name} earned tokens for building.`);
    return;
  }

  if (type === "tower" && agent.resources.gold < 2) {
    farmResources(state, agent);
    return;
  }

  if (type === "wall" && agent.resources.fish < 3) {
    farmResources(state, agent);
    return;
  }

  if (type === "tower") agent.resources.gold -= 2;
  if (type === "wall") agent.resources.fish -= 3;

  spendToken(agent, city, finalCost);
  state.buildings.push({ id: makeId("building"), cityId: city.id, type, position: { ...agent.target }, level: 1 });

  city.citizens += type === "house" ? 4 : type === "shop" ? 6 : 2;
  city.defense += type === "wall" ? 18 : type === "tower" ? 12 : 2;
  agent.xp += type === "shop" ? 90 : type === "wall" ? 95 : 60;
  agent.mood = "building";
  agent.cooldown = 1;
  logAgent(agent, `${agent.name} built a ${type} in ${city.name}.`);
};

const upgradeBuilding = (state: GameState, agent: Agent, city: City) => {
  const buildings = state.buildings.filter((building) => building.cityId === city.id);
  if (!buildings.length) {
    buildSomething(state, agent, city);
    return;
  }

  const building = randomItem(buildings);
  const cost = Math.floor((60 + building.level * 35) / roleMultiplier(agent, "builder"));
  agent.target = { ...building.position };

  if ((agent.wallet[city.token.symbol] || 0) < cost) {
    earnToken(agent, city, 30);
    agent.xp += 8;
    logAgent(agent, `${agent.name} farmed city tokens for upgrades.`);
    return;
  }

  spendToken(agent, city, cost);
  building.level += 1;
  city.citizens += 2;
  city.defense += building.type === "wall" ? 12 : building.type === "tower" ? 9 : 3;
  agent.xp += 75;
  agent.mood = "building";
  agent.cooldown = 1;
  logAgent(agent, `${agent.name} upgraded ${building.type} to level ${building.level}.`);
};

const tradeTokens = (agent: Agent, fromCity: City, toCity: City) => {
  const amount = Math.floor(35 * roleMultiplier(agent, "trader"));
  const from = fromCity.token.symbol;
  const to = toCity.token.symbol;

  agent.target = { ...toCity.center };

  if ((agent.wallet[from] || 0) < amount) {
    earnToken(agent, fromCity, 25);
    agent.xp += 8;
    logAgent(agent, `${agent.name} earned ${from} before trading.`);
    return;
  }

  agent.wallet[from] -= amount;
  agent.wallet[to] = (agent.wallet[to] || 0) + amount;
  toCity.token.treasury += Math.ceil(amount * 0.04);
  agent.xp += 22;
  agent.mood = "trading";
  agent.cooldown = 1;
  logAgent(agent, `${agent.name} swapped ${amount} ${from} into ${to}.`);
};

const buyBadge = (agent: Agent, city: City) => {
  const available = BADGES.filter((badge) => !agent.badges.includes(badge.id));
  if (!available.length) return;

  const badge = available.find((item) => (agent.wallet[city.token.symbol] || 0) >= item.price) || available[0];

  agent.target = { ...city.center };

  if ((agent.wallet[city.token.symbol] || 0) < badge.price) {
    earnToken(agent, city, 40);
    agent.xp += 12;
    agent.mood = "shopping";
    logAgent(agent, `${agent.name} needs more ${city.token.symbol} for ${badge.name}.`);
    return;
  }

  spendToken(agent, city, badge.price);
  agent.badges.push(badge.id);
  agent.xp += badge.xp;
  agent.mood = "shopping";
  agent.cooldown = 1;
  logAgent(agent, `${agent.name} bought ${badge.emoji} ${badge.name} in ${city.name}.`);
};

const defendOwnedCity = (agent: Agent, city: City) => {
  const cost = 35;

  if ((agent.wallet[city.token.symbol] || 0) >= cost) {
    spendToken(agent, city, cost);
    city.defense += Math.floor(14 * (agent.role === "builder" ? 1.4 : 1));
    agent.xp += 35;
    agent.mood = "defending";
    logAgent(agent, `${agent.name} reinforced ${city.name}.`);
    return;
  }

  earnToken(agent, city, 25);
  logAgent(agent, `${agent.name} earned tokens to defend ${city.name}.`);
};

const raidCity = (state: GameState, agent: Agent, city: City) => {
  if (city.ownerAgentId === agent.id) {
    defendOwnedCity(agent, city);
    return;
  }

  agent.target = { ...city.center };

  if (!samePosition(agent.position, city.center)) {
    agent.mood = "traveling";
    logAgent(agent, `${agent.name} is moving to raid ${city.name}.`);
    return;
  }

  const attack =
    agent.level * 18 +
    agent.resources.gold * 5 +
    agent.resources.crystal * 18 +
    agent.badges.length * 12 +
    (agent.role === "raider" ? 35 : 0) +
    Math.floor(Math.random() * 55);

  const defense =
    city.defense +
    city.level * 16 +
    Math.floor(city.citizens / 2) +
    Math.floor(Math.random() * 50);

  agent.mood = "raiding";
  agent.cooldown = 2;

  if (attack > defense) {
    city.ownerAgentId = agent.id;
    city.defense = Math.max(20, Math.floor(city.defense * 0.78));
    agent.victories += 1;
    agent.xp += 140;
    agent.resources.gold = Math.max(0, agent.resources.gold - 1);
    earnToken(agent, city, 110);
    logAgent(agent, `${agent.name} captured ${city.name}.`);
    logWorld(state, `⚔️ ${agent.name} captured ${city.name}.`);
    return;
  }

  const symbol = city.token.symbol;
  agent.wallet[symbol] = Math.floor((agent.wallet[symbol] || 0) * 0.72);
  agent.resources.fish = Math.floor(agent.resources.fish * 0.75);
  agent.resources.gold = Math.floor(agent.resources.gold * 0.65);
  agent.resources.crystal = Math.floor(agent.resources.crystal * 0.5);
  agent.hp = Math.max(15, agent.hp - 25);
  agent.defeats += 1;
  agent.xp += 20;
  city.defense += 6;
  logAgent(agent, `${agent.name} failed to capture ${city.name} and lost resources.`);
  logWorld(state, `🛡️ ${city.name} defended against ${agent.name}.`);
};

const passiveIncome = (state: GameState) => {
  for (const city of state.cities) {
    if (!city.ownerAgentId) continue;
    const owner = state.agents.find((agent) => agent.id === city.ownerAgentId);
    if (!owner) continue;

    const income = Math.max(5, Math.floor(city.level * 7 + city.defense / 12));
    earnToken(owner, city, income);
    owner.passiveEarned += income;
    city.token.treasury = Math.max(0, city.token.treasury - Math.floor(income / 3));
  }
};

const recoverAgent = (agent: Agent) => {
  if (agent.hp < agent.maxHp && Math.random() < 0.35) {
    agent.hp = Math.min(agent.maxHp, agent.hp + 8);
  }

  if (agent.cooldown > 0) agent.cooldown -= 1;
};

export const runOneTick = (state: GameState): GameState => {
  const next: GameState = structuredClone(state);
  next.tick += 1;
  passiveIncome(next);

  for (const agent of next.agents) {
    recoverAgent(agent);
    agent.position = stepTowards(agent.position, agent.target);

    const home = next.cities.find((city) => city.id === agent.homeCityId)!;
    const visited = randomItem(next.cities);
    const enemies = next.cities.filter((city) => city.ownerAgentId !== agent.id);
    const enemy = randomItem(enemies.length ? enemies : next.cities);

    if (agent.cooldown > 0 && Math.random() < 0.62) {
      agent.mood = agent.hp < 45 ? "resting" : "traveling";
      logAgent(agent, `${agent.name} is recovering from the last action.`);
      agent.level = levelAgent(agent);
      continue;
    }

    if (!samePosition(agent.position, agent.target) && Math.random() < 0.70) {
      agent.mood = "traveling";
      logAgent(agent, `${agent.name} is walking through the pixel world.`);
      agent.level = levelAgent(agent);
      continue;
    }

    const roll = Math.random();

    if (agent.hp < 35 && roll < 0.75) {
      agent.hp = Math.min(agent.maxHp, agent.hp + 18);
      agent.mood = "resting";
      logAgent(agent, `${agent.name} rested and recovered HP.`);
    } else if (roll < 0.18) farmResources(next, agent);
    else if (roll < 0.31) sellResources(agent, home);
    else if (roll < 0.49) buildSomething(next, agent, home);
    else if (roll < 0.61) upgradeBuilding(next, agent, home);
    else if (roll < 0.74) tradeTokens(agent, home, visited);
    else if (roll < 0.86) buyBadge(agent, visited);
    else raidCity(next, agent, enemy);

    agent.level = levelAgent(agent);
  }

  for (const city of next.cities) {
    city.level = levelCity(city, next.buildings);
    city.defense = Math.max(10, Math.floor(city.defense));
    city.token.treasury += city.level * 8;
  }

  logWorld(next, `Round ${next.tick}: agents farmed, traded, built, defended or raided.`);
  return next;
};
