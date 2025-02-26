// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BreakoutGame is ERC721, Ownable {
    struct GameState {
        uint bricksToBreak;
        uint totalBricksBroken;
        mapping(address => uint) bricksBrokenByPlayer;
        mapping(address => uint) bricksBrokenInCurrentLevel;
    }

    mapping(address => GameState) public games;
    mapping(address => uint) public playerLevels;
    mapping(address => mapping(address => bool)) public isAuthorizedRelayer;

    event BrickBroken(address player, uint totalBricksBroken, uint bricksToBreak);
    event LevelUp(address player, uint newLevel);
    event NewGameStarted(address player);
    event RelayerAuthorized(address player, address relayer, bool authorized);

    constructor() Ownable(msg.sender) ERC721("BreakoutGameNFT", "BGNFT") {}

    function authorizeRelayer(address relayer, bool authorized) public {
        isAuthorizedRelayer[msg.sender][relayer] = authorized;
        emit RelayerAuthorized(msg.sender, relayer, authorized);
    }

    modifier onlyPlayerOrRelayer(address player) {
        require(msg.sender == player || isAuthorizedRelayer[player][msg.sender], "Not authorized");
        _;
    }

    function startGame(address player) public onlyPlayerOrRelayer(player) {
        GameState storage game = games[player];
        playerLevels[player] = 1;
        game.bricksToBreak = 150 * playerLevels[player];
        game.totalBricksBroken = 0;
        game.bricksBrokenInCurrentLevel[player] = 0;

        emit NewGameStarted(player);
    }

    function breakBrick() public onlyPlayerOrRelayer(msg.sender) {
        GameState storage game = games[msg.sender];

        game.totalBricksBroken += 1;
        game.bricksBrokenByPlayer[msg.sender] += 1;
        game.bricksBrokenInCurrentLevel[msg.sender] += 1;
        game.bricksToBreak -= 1;

        emit BrickBroken(msg.sender, game.totalBricksBroken, game.bricksToBreak);

        if (game.bricksToBreak == 0) {
            levelUp(msg.sender);
        }
    }

    function levelUp(address player) private {
        playerLevels[player] += 1;
        GameState storage game = games[player];
        game.bricksToBreak = 150 * playerLevels[player];
        game.bricksBrokenInCurrentLevel[player] = 0;

        // Mint an NFT to the player
        _mint(player, playerLevels[player]);

        emit LevelUp(player, playerLevels[player]);
    }

    function getPlayerLevel(address player) public view returns (uint) {
        return playerLevels[player];
    }

    function getBricksToBreak(address player) public view returns (uint) {
        return games[player].bricksToBreak;
    }

    function getTotalBricksBroken(address player) public view returns (uint) {
        return games[player].totalBricksBroken;
    }

    function getBricksBrokenInCurrentLevel(address player) public view returns (uint) {
        return games[player].bricksBrokenInCurrentLevel[player];
    }
}
