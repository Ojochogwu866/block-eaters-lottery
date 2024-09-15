import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("LotteryContract", function () {
  async function deployLotteryContractFixture() {
    const [manager, player1, player2, player3] = await hre.ethers.getSigners();

    const LotteryContract = await hre.ethers.getContractFactory("LotteryContract");
    const lotteryContract = await LotteryContract.deploy();

    return { lotteryContract, manager, player1, player2, player3 };
  }

  describe("Deployment", function () {
    it("Should set the right manager", async function () {
      const { lotteryContract, manager } = await loadFixture(deployLotteryContractFixture);
      expect(await lotteryContract.manager()).to.equal(manager.address);
    });
  });

  describe("Participation", function () {
    it("Should allow a player to participate with 1 ether", async function () {
      const { lotteryContract, player1 } = await loadFixture(deployLotteryContractFixture);
      await expect(lotteryContract.connect(player1).participate({ value: hre.ethers.parseEther("1") }))
        .to.not.be.reverted;
    });

    it("Should revert if a player tries to participate with less than 1 ether", async function () {
      const { lotteryContract, player1 } = await loadFixture(deployLotteryContractFixture);
      await expect(lotteryContract.connect(player1).participate({ value: hre.ethers.parseEther("0.5") }))
        .to.be.revertedWith("Please pay 1 ether only");
    });
  });

  describe("Get Balance", function () {
    it("Should allow manager to get balance", async function () {
      const { lotteryContract, manager, player1 } = await loadFixture(deployLotteryContractFixture);
      await lotteryContract.connect(player1).participate({ value: hre.ethers.parseEther("1") });
      const balance = await lotteryContract.connect(manager).getBalance();
      expect(balance).to.equal(hre.ethers.parseEther("1"));
    });

    it("Should revert if non-manager tries to get balance", async function () {
      const { lotteryContract, player1 } = await loadFixture(deployLotteryContractFixture);
      await expect(lotteryContract.connect(player1).getBalance())
        .to.be.revertedWith("You are not the manager");
    });
  });

  describe("Pick Winner", function () {
    it("Should allow manager to pick a winner when there are at least 3 players", async function () {
      const { lotteryContract, manager, player1, player2, player3 } = await loadFixture(deployLotteryContractFixture);
      
      await lotteryContract.connect(player1).participate({ value: hre.ethers.parseEther("1") });
      await lotteryContract.connect(player2).participate({ value: hre.ethers.parseEther("1") });
      await lotteryContract.connect(player3).participate({ value: hre.ethers.parseEther("1") });

      await expect(lotteryContract.connect(manager).pickWinner()).to.not.be.reverted;
    });

    it("Should revert if non-manager tries to pick a winner", async function () {
      const { lotteryContract, player1, player2, player3 } = await loadFixture(deployLotteryContractFixture);
      
      await lotteryContract.connect(player1).participate({ value: hre.ethers.parseEther("1") });
      await lotteryContract.connect(player2).participate({ value: hre.ethers.parseEther("1") });
      await lotteryContract.connect(player3).participate({ value: hre.ethers.parseEther("1") });

      await expect(lotteryContract.connect(player1).pickWinner())
        .to.be.revertedWith("You are the winner of the lottery");
    });

    it("Should revert if there are less than 3 players", async function () {
      const { lotteryContract, manager, player1 } = await loadFixture(deployLotteryContractFixture);
      
      await lotteryContract.connect(player1).participate({ value: hre.ethers.parseEther("1") });

      await expect(lotteryContract.connect(manager).pickWinner())
        .to.be.revertedWith("Players are less than 3");
    });

    it("Should transfer the balance to the winner", async function () {
      const { lotteryContract, manager, player1, player2, player3 } = await loadFixture(deployLotteryContractFixture);
      
      await lotteryContract.connect(player1).participate({ value: hre.ethers.parseEther("1") });
      await lotteryContract.connect(player2).participate({ value: hre.ethers.parseEther("1") });
      await lotteryContract.connect(player3).participate({ value: hre.ethers.parseEther("1") });

      const initialBalance = await hre.ethers.provider.getBalance(player1.address);
      
      await lotteryContract.connect(manager).pickWinner();
      
      const finalBalance = await hre.ethers.provider.getBalance(player1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});