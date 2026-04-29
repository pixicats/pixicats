// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PixiBadges is ERC1155, Ownable {
    mapping(uint256 => uint256) public badgePrices;

    event BadgeMinted(address indexed buyer, uint256 indexed badgeId, uint256 amount);

    constructor(string memory baseURI) ERC1155(baseURI) Ownable(msg.sender) {
        badgePrices[1] = 0.0001 ether;
        badgePrices[2] = 0.00025 ether;
        badgePrices[3] = 0.0005 ether;
        badgePrices[4] = 0.001 ether;
        badgePrices[5] = 0.002 ether;
        badgePrices[6] = 0.004 ether;
    }

    function setBadgePrice(uint256 badgeId, uint256 price) external onlyOwner {
        badgePrices[badgeId] = price;
    }

    function mintBadge(uint256 badgeId, uint256 amount) external payable {
        require(badgeId >= 1 && badgeId <= 6, "BADGE_NOT_FOUND");
        require(amount > 0, "AMOUNT_REQUIRED");
        require(msg.value >= badgePrices[badgeId] * amount, "INSUFFICIENT_ETH");

        _mint(msg.sender, badgeId, amount, "");
        emit BadgeMinted(msg.sender, badgeId, amount);
    }

    function withdraw(address payable to) external onlyOwner {
        require(to != address(0), "ZERO_ADDRESS");
        to.transfer(address(this).balance);
    }
}
