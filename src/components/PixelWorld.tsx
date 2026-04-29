import React from "react";
import { Agent, Building, City, GameState, Tile } from "../game/types";

type Props = {
  state: GameState;
};

const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

const tileClass = (tile: Tile) => `tile tile-${tile.type}`;

const BuildingSprite = ({ building, cities }: { building: Building; cities: City[] }) => {
  const city = cities.find((item) => item.id === building.cityId);

  return (
    <div
      className={`buildingSprite building-${building.type}`}
      title={`${city?.name || "City"} ${building.type} level ${building.level}`}
      style={{
        gridColumnStart: building.position.x + 1,
        gridRowStart: building.position.y + 1,
        borderColor: city?.color || "#ffffff"
      }}
    >
      <img
        src={asset(`buildings/building_${building.type}.png`)}
        className="buildingImage"
        alt={building.type}
        draggable={false}
      />
      <b>{building.level}</b>
    </div>
  );
};

const CatSprite = ({ agent }: { agent: Agent }) => {
  return (
    <div
      className={`catSpriteWrap role-${agent.role}`}
      title={`${agent.name} | ${agent.role} | Level ${agent.level} | HP ${agent.hp}`}
      style={{
        gridColumnStart: agent.position.x + 1,
        gridRowStart: agent.position.y + 1
      }}
    >
      <img
        src={asset(`cats/cat_${agent.catColor}.png`)}
        className="catImage"
        alt={agent.name}
        draggable={false}
      />
      <b>{agent.level}</b>
    </div>
  );
};

export const PixelWorld = ({ state }: Props) => {
  return (
    <div className="worldWrap">
      <div
        className="pixelWorld"
        style={{
          gridTemplateColumns: `repeat(${state.width}, 32px)`,
          gridTemplateRows: `repeat(${state.height}, 32px)`
        }}
      >
        {state.tiles.map((tile) => {
          const city = tile.cityId ? state.cities.find((item) => item.id === tile.cityId) : undefined;
          const isResource = tile.type === "fish" || tile.type === "gold" || tile.type === "crystal";

          return (
            <div
              key={`${tile.x}-${tile.y}`}
              className={tileClass(tile)}
              title={tile.resourceAmount ? `${tile.type}: ${tile.resourceAmount}` : tile.type}
              style={city ? { "--city-color": city.color } as React.CSSProperties : undefined}
            >
              <img
                src={asset(`tiles/tile_${tile.type}.png`)}
                className="tileImage"
                alt=""
                draggable={false}
              />

              {isResource && (
                <img
                  src={asset(`resources/resource_${tile.type}.png`)}
                  className="resourceOverlay"
                  alt={tile.type}
                  draggable={false}
                />
              )}
            </div>
          );
        })}

        {state.cities.map((city) => {
          const owner = state.agents.find((agent) => agent.id === city.ownerAgentId);

          return (
            <div
              key={city.id}
              className="cityLabel"
              style={{
                gridColumnStart: city.center.x - 1,
                gridColumnEnd: city.center.x + 4,
                gridRowStart: city.center.y - 2,
                color: city.color
              }}
            >
              {city.name} ${city.token.symbol} {owner ? `👑${owner.name}` : ""}
            </div>
          );
        })}

        {state.buildings.map((building) => (
          <BuildingSprite building={building} cities={state.cities} key={building.id} />
        ))}

        {state.agents.map((agent) => (
          <CatSprite agent={agent} key={agent.id} />
        ))}
      </div>

      <div className="legend">
        <span><i className="legendGrass" /> grass</span>
        <span><i className="legendCity" /> city</span>
        <span><i className="legendRoad" /> road</span>
        <span><i className="legendWater" /> water</span>
        <span><i className="legendFish" /> fish</span>
        <span><i className="legendGold" /> gold</span>
        <span><i className="legendCrystal" /> crystal</span>
      </div>
    </div>
  );
};
