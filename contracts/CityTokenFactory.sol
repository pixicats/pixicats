// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CityToken is ERC20 {
    address public cityOwner;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        address owner_
    ) ERC20(name_, symbol_) {
        cityOwner = owner_;
        _mint(owner_, initialSupply_);
    }
}

contract CityTokenFactory {
    struct CityTokenInfo {
        address token;
        address owner;
        string cityName;
        string tokenName;
        string tokenSymbol;
        uint256 createdAt;
    }

    CityTokenInfo[] public cityTokens;

    event CityTokenCreated(
        address indexed token,
        address indexed owner,
        string cityName,
        string tokenName,
        string tokenSymbol
    );

    function createCityToken(
        string calldata cityName,
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 initialSupply
    ) external returns (address tokenAddress) {
        require(bytes(cityName).length > 0, "CITY_REQUIRED");
        require(bytes(tokenName).length > 0, "TOKEN_NAME_REQUIRED");
        require(bytes(tokenSymbol).length > 0, "SYMBOL_REQUIRED");
        require(initialSupply > 0, "SUPPLY_REQUIRED");

        CityToken token = new CityToken(
            tokenName,
            tokenSymbol,
            initialSupply,
            msg.sender
        );

        tokenAddress = address(token);

        cityTokens.push(CityTokenInfo({
            token: tokenAddress,
            owner: msg.sender,
            cityName: cityName,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            createdAt: block.timestamp
        }));

        emit CityTokenCreated(tokenAddress, msg.sender, cityName, tokenName, tokenSymbol);
    }

    function allCityTokensLength() external view returns (uint256) {
        return cityTokens.length;
    }
}
