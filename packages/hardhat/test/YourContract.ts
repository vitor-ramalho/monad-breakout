import { expect } from "chai";
import { ethers } from "hardhat";
import { BreakoutGame } from "../typechain-types";

describe("BreakoutGame", function () {
  let breakoutGame: BreakoutGame;
  let owner: any;
  let player: any;
  let relayer: any;

  before(async () => {
    [owner, player, relayer] = await ethers.getSigners();
    const breakoutGameFactory = await ethers.getContractFactory("BreakoutGame");
    breakoutGame = (await breakoutGameFactory.deploy()) as BreakoutGame;
    await breakoutGame.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await breakoutGame.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero bricks broken", async function () {
      await breakoutGame.startGame(player.address);
      expect(await breakoutGame.getTotalBricksBroken(player.address)).to.equal(0);
    });

    it("Should initialize with level 1", async function () {
      await breakoutGame.startGame(player.address);
      expect(await breakoutGame.getPlayerLevel(player.address)).to.equal(1);
    });
  });

  describe("Relayer Authorization", function () {
    it("should authorize a relayer", async function () {
      await breakoutGame.connect(player).authorizeRelayer(relayer.address, true);
      expect(await breakoutGame.isAuthorizedRelayer(player.address, relayer.address)).to.be.true;
    });

    it("should not allow unauthorized relayer to break a brick", async function () {
      await expect(breakoutGame.connect(relayer).breakBrick(1)).to.be.revertedWith("Not authorized");
    });

    it("should allow authorized relayer to break a brick", async function () {
      await breakoutGame.connect(player).authorizeRelayer(relayer.address, true);
      await breakoutGame.connect(relayer).breakBrick(1);
      expect(await breakoutGame.getTotalBricksBroken(player.address)).to.equal(1);
    });
  });

  describe("Brick Breaking", function () {
    it("should level up the player after breaking enough bricks", async function () {
      await breakoutGame.startGame(player.address);
      const bricksToBreak = await breakoutGame.getBricksToBreak(player.address);
      for (let i = 0; i < bricksToBreak; i++) {
        await breakoutGame.connect(player).breakBrick(i);
      }
      expect(await breakoutGame.getPlayerLevel(player.address)).to.equal(2);
    });

    it("should reset bricks broken in current level after leveling up", async function () {
      await breakoutGame.startGame(player.address);
      const bricksToBreak = await breakoutGame.getBricksToBreak(player.address);
      for (let i = 0; i < bricksToBreak; i++) {
        await breakoutGame.connect(player).breakBrick(i);
      }
      expect(await breakoutGame.getBricksBrokenInCurrentLevel(player.address)).to.equal(0);
    });
  });
});
