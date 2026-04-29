import { useEffect, useMemo, useState } from "react";
import { Bot, Coins, Crown, Play, RotateCcw, Sparkles, Swords } from "lucide-react";
import { AgentCreator } from "./components/AgentCreator";
import { PixelWorld } from "./components/PixelWorld";
import { BADGES } from "./game/badges";
import { createInitialWorld } from "./game/createWorld";
import { runOneTick } from "./game/engine";
import { GameState } from "./game/types";

const STORAGE_KEY = "pixicats-web3-pvp-v5";

const loadState = (): GameState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createInitialWorld();

  try {
    const parsed = JSON.parse(saved) as GameState;
    if (!parsed.tiles || !parsed.buildings || !parsed.agents || !parsed.agents[0]?.resources) {
      return createInitialWorld();
    }
    return parsed;
  } catch {
    return createInitialWorld();
  }
};

export const App = () => {
  const [state, setState] = useState<GameState>(loadState);
  const [autoRun, setAutoRun] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!autoRun) return;

    const timer = window.setInterval(() => {
      setState((current) => runOneTick(current));
    }, 850);

    return () => window.clearInterval(timer);
  }, [autoRun]);

  const totalVictories = useMemo(
    () => state.agents.reduce((sum, agent) => sum + agent.victories, 0),
    [state.agents]
  );

  const totalResources = useMemo(
    () => state.agents.reduce((sum, agent) => sum + agent.resources.fish + agent.resources.gold + agent.resources.crystal, 0),
    [state.agents]
  );

  const resetWorld = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createInitialWorld());
    setAutoRun(false);
  };

  return (
    <main className="appShell">
      <section className="topPanel">
        <div>
          <p className="eyebrow">Autonomous agent PvP economy</p>
          <h1>PixiCats</h1>
          <p className="intro">
            Cat agents farm resources, build pixel cities, trade tokens, buy badges, defend cities and raid rivals for control.
          </p>
        </div>

        <div className="actions">
          <button onClick={() => setState((current) => runOneTick(current))}>
            <Play size={18} />
            Run round
          </button>

          <button className={autoRun ? "danger" : "secondary"} onClick={() => setAutoRun(!autoRun)}>
            <Bot size={18} />
            {autoRun ? "Stop agents" : "Auto agents"}
          </button>

          <button className="ghost" onClick={resetWorld}>
            <RotateCcw size={18} />
            Reset world
          </button>
        </div>
      </section>

      <AgentCreator state={state} setState={setState} />

      <section className="quickStats">
        <article>
          <Sparkles size={22} />
          <span>Round</span>
          <b>{state.tick}</b>
        </article>
        <article>
          <Crown size={22} />
          <span>Cities</span>
          <b>{state.cities.length}</b>
        </article>
        <article>
          <Swords size={22} />
          <span>City captures</span>
          <b>{totalVictories}</b>
        </article>
        <article>
          <Coins size={22} />
          <span>Resources held</span>
          <b>{totalResources}</b>
        </article>
      </section>

      <section className="gameGrid">
        <div className="worldCard">
          <div className="sectionTitle">
            <h2>Pixel world</h2>
            <p>Fish, gold and crystal are limited. Cities can be captured.</p>
          </div>
          <PixelWorld state={state} />
        </div>

        <aside className="sidePanel">
          <h2>Badge shop</h2>
          <div className="badgeList">
            {BADGES.map((badge) => (
              <article key={badge.id}>
                <span className="badgeEmoji">{badge.emoji}</span>
                <div>
                  <b>{badge.name}</b>
                  <p>{badge.description}</p>
                </div>
                <strong>{badge.price}</strong>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="cityCards">
        {state.cities.map((city) => {
          const buildings = state.buildings.filter((building) => building.cityId === city.id);
          const owner = state.agents.find((agent) => agent.id === city.ownerAgentId);

          return (
            <article className="cityCard" key={city.id} style={{ "--city-color": city.color } as React.CSSProperties}>
              <div className="cityCardHeader">
                <div>
                  <h3>{city.name}</h3>
                  <p>{city.token.name}</p>
                </div>
                <span>${city.token.symbol}</span>
              </div>

              <p className="ownerLine">Owner: {owner ? `${owner.name} (${owner.role})` : "No owner"}</p>

              <div className="cityNumbers">
                <p>Level <b>{city.level}</b></p>
                <p>Defense <b>{city.defense}</b></p>
                <p>Buildings <b>{buildings.length}</b></p>
                <p>Treasury <b>{Math.floor(city.token.treasury)}</b></p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="agentsArea">
        <div className="sectionTitle">
          <h2>Cat agents</h2>
          <p>Each agent has role, HP, resources, city tokens and PvP stats.</p>
        </div>

        <div className="agentCards">
          {state.agents.map((agent) => (
            <article className="agentCard" key={agent.id}>
              <div className="agentHeader">
                <div className={`miniCat cat-${agent.catColor}`}>
                  <span />
                </div>
                <div>
                  <h3>{agent.name}</h3>
                  <p>Level {agent.level} • {agent.role} • {agent.mood}</p>
                </div>
              </div>

              <div className="hpBar">
                <span style={{ width: `${Math.max(0, Math.min(100, agent.hp))}%` }} />
              </div>

              <p className="ownerLine">
                HP {agent.hp}/{agent.maxHp} • W {agent.victories} / L {agent.defeats} • passive {agent.passiveEarned}
              </p>

              {agent.ownerWallet && (
                <p className="ownerLine">Wallet: {agent.ownerWallet.slice(0, 6)}...{agent.ownerWallet.slice(-4)}</p>
              )}

              {agent.creationTx && (
                <p className="ownerLine">Base TX: {agent.creationTx.slice(0, 10)}...</p>
              )}

              <div className="resourceGrid">
                <span>🐟 {agent.resources.fish}</span>
                <span>🪙 {agent.resources.gold}</span>
                <span>💎 {agent.resources.crystal}</span>
              </div>

              <div className="walletGrid">
                {Object.entries(agent.wallet).map(([symbol, amount]) => (
                  <span key={symbol}>{symbol}: {Math.floor(amount)}</span>
                ))}
              </div>

              <div className="ownedBadges">
                {agent.badges.length === 0 ? (
                  <em>No badges yet</em>
                ) : (
                  agent.badges.map((badgeId) => {
                    const badge = BADGES.find((item) => item.id === badgeId);
                    return <span key={badgeId}>{badge?.emoji} {badge?.name}</span>;
                  })
                )}
              </div>

              <ul>
                {agent.log.slice(0, 5).map((entry, index) => (
                  <li key={`${agent.id}-${index}`}>{entry}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="gameLoop">
        <h2>Core loop</h2>
        <div>
          <span>farm</span>
          <span>sell</span>
          <span>build</span>
          <span>trade</span>
          <span>defend</span>
          <span>raid</span>
          <span>capture</span>
          <span>earn</span>
        </div>
      </section>

      <section className="worldLog">
        <h2>World log</h2>
        <ul>
          {state.worldLog.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </section>
    </main>
  );
};
