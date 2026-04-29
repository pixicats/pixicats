import { useState } from "react";
import { AgentRole, CatColor, GameState } from "../game/types";
import { createPlayerAgent } from "../game/createWorld";
import { connectWallet, createOnchainAgent, getChainId, switchToBase } from "../web3/base";

type Props = {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
};

const catColors: CatColor[] = ["orange", "black", "white", "gray", "purple", "blue"];
const roles: AgentRole[] = ["builder", "trader", "raider", "farmer"];

export const AgentCreator = ({ state, setState }: Props) => {
  const [wallet, setWallet] = useState<string>("");
  const [agentName, setAgentName] = useState("My PixiCat");
  const [catColor, setCatColor] = useState<CatColor>("orange");
  const [role, setRole] = useState<AgentRole>("builder");
  const [homeCityId, setHomeCityId] = useState("meowpolis");
  const [status, setStatus] = useState("Not connected");
  const [isLoading, setIsLoading] = useState(false);

  const onConnect = async () => {
    try {
      setIsLoading(true);
      const account = await connectWallet();
      const chainId = await getChainId();
      setWallet(account);
      setStatus(chainId === "0x2105" ? "Connected to Base Mainnet" : `Connected, chain ${chainId}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateLocalAgent = () => {
    const cleanName = agentName.trim() || "PixiCat";
    const newAgent = createPlayerAgent(cleanName, catColor, role, wallet || undefined, homeCityId);

    setState((current) => ({
      ...current,
      agents: [...current.agents, newAgent],
      worldLog: [`${cleanName} joined as a ${role}.`, ...current.worldLog].slice(0, 14)
    }));

    setStatus(`${cleanName} added locally.`);
  };

  const onCreateBaseAgent = async () => {
    try {
      setIsLoading(true);
      let account = wallet;

      if (!account) {
        account = await connectWallet();
        setWallet(account);
      } else {
        await switchToBase();
      }

      const cleanName = agentName.trim() || "PixiCat";
      const metadata = JSON.stringify({
        name: cleanName,
        catColor,
        role,
        homeCityId,
        game: "PixiCats",
        chain: "Base Mainnet"
      });

      const result = await createOnchainAgent(cleanName, catColor, metadata);
      const newAgent = {
        ...createPlayerAgent(cleanName, catColor, role, account || undefined, homeCityId),
        creationTx: result.hash
      };

      setState((current) => ({
        ...current,
        agents: [...current.agents, newAgent],
        worldLog: [`${cleanName} was created on Base Mainnet. TX: ${result.hash}`, ...current.worldLog].slice(0, 14)
      }));

      setStatus(`Created on Base. TX: ${result.hash.slice(0, 10)}...`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Base transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="creatorPanel">
      <div>
        <p className="eyebrow small">Base Mainnet + PvP Economy</p>
        <h2>Create or connect your agent</h2>
        <p className="creatorNote">
          Builders build cheaper, traders sell resources better, raiders attack stronger, farmers mine more.
        </p>
      </div>

      <div className="creatorForm">
        <label>
          Agent name
          <input value={agentName} onChange={(event) => setAgentName(event.target.value)} placeholder="Agent name" />
        </label>

        <label>
          Cat color
          <select value={catColor} onChange={(event) => setCatColor(event.target.value as CatColor)}>
            {catColors.map((color) => <option key={color} value={color}>{color}</option>)}
          </select>
        </label>

        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as AgentRole)}>
            {roles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Home city
          <select value={homeCityId} onChange={(event) => setHomeCityId(event.target.value)}>
            {state.cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </label>
      </div>

      <div className="creatorActions">
        <button onClick={onConnect} disabled={isLoading}>Connect wallet</button>
        <button className="secondary" onClick={onCreateLocalAgent} disabled={isLoading}>Create local agent</button>
        <button className="baseButton" onClick={onCreateBaseAgent} disabled={isLoading}>Create on Base</button>
      </div>

      <div className="walletStatus">
        <span>{status}</span>
        {wallet && <b>{wallet.slice(0, 6)}...{wallet.slice(-4)}</b>}
      </div>
    </section>
  );
};
