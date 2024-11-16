import {
  time as networkTime,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers, network } from "hardhat";
import { ToppSignalPool } from "../typechain-types";

describe("ERC20ToppSignalPool", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployToppSignalPool() {
    const [owner, ...otherAccounts] = await hre.ethers.getSigners();

    const SignalTicket = await hre.ethers.getContractFactory(
      "SignalTicketERC1155"
    );
    const signalTicket = await SignalTicket.deploy();
    const TestPriceOracle = await hre.ethers.getContractFactory(
      "TestPriceOracle"
    );
    const priceOracle = await TestPriceOracle.deploy();
    const TestRandomOracle = await hre.ethers.getContractFactory(
      "TestRandomOracle"
    );
    const randomOracle = await TestRandomOracle.deploy();
    const reservePool = owner.address;
    const feeCollector = owner.address;

    const maxTicketPerSlot = 100;
    const currencyDecimals = 18;
    const ticketPrice = hre.ethers.parseUnits("0.01", currencyDecimals);

    const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
    const currency = await TestERC20.deploy();
    const currencyAddress = await currency.getAddress();

    const toppSignalPool = await hre.ethers.deployContract(
      "ERC20ToppSignalPool",
      [
        await signalTicket.getAddress(),
        await priceOracle.getAddress(),
        await randomOracle.getAddress(),
        feeCollector,
        reservePool,
        maxTicketPerSlot,
        ticketPrice,
        currencyAddress,
      ]
    );

    const toppSignalPoolAddress = await toppSignalPool.getAddress();

    await signalTicket.transferOwnership(toppSignalPoolAddress);
    await priceOracle.setCaller(toppSignalPoolAddress);
    await randomOracle.setCaller(toppSignalPoolAddress);

    return {
      signalTicket,
      priceOracle,
      randomOracle,
      currency,
      toppSignalPool,
      currencyDecimals,
      ticketPrice,
      owner,
      otherAccounts,
    };
  }

  async function placeBid() {
    const deploymentFixture = await loadFixture(deployToppSignalPool);
    const {
      signalTicket,
      priceOracle,
      randomOracle,
      currency,
      toppSignalPool,
      currencyDecimals,
      owner,
    } = deploymentFixture;

    const mintAmount = hre.ethers.parseUnits("1000000", currencyDecimals);

    const time = await networkTime.latest();
    const price = "6000000";
    const amount = "10";

    const toppSignalPoolAddress = await toppSignalPool.getAddress();

    await currency.mint(owner.address, mintAmount);
    await currency.approve(toppSignalPoolAddress, hre.ethers.MaxUint256);

    await toppSignalPool.placeBid(time, price, amount);

    return {
      ...deploymentFixture,
      time,
      price,
      amount,
    };
  }

  async function placeBids() {
    const deploymentFixture = await loadFixture(deployToppSignalPool);
    const { currency, toppSignalPool, otherAccounts } = deploymentFixture;

    const currencyDecimals = await currency.decimals();
    const toppSignalPoolAddress = await toppSignalPool.getAddress();

    const mintAmount = hre.ethers.parseUnits("1000000", currencyDecimals);

    const time = await networkTime.latest();

    const prices = ["6000000", "6000100", "6000100", "6000200", "6000300"];
    const amounts = ["10", "10", "20", "10", "10"];

    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      const amount = amounts[i];

      await currency.mint(otherAccounts[i].address, mintAmount);
      await currency
        .connect(otherAccounts[i])
        .approve(toppSignalPoolAddress, hre.ethers.MaxUint256);
      await toppSignalPool
        .connect(otherAccounts[i])
        .placeBid(time, price, amount);
    }

    return {
      ...deploymentFixture,
      time,
      prices,
      amounts,
    };
  }

  function combineNumbers(num1: number, num2: number): bigint {
    if (num1 >= 1n << 128n) {
      throw new Error("num1 is too large");
    }
    if (num2 >= 1n << 128n) {
      throw new Error("num2 is too large");
    }
    return (BigInt(num1) << 128n) | BigInt(num2);
  }

  async function checkLuckyPrices(
    toppSignalPool: ToppSignalPool,
    time: number
  ) {
    for (let i = 0; i < 3; i++) {
      const luckyPrice = await toppSignalPool.settledLucky(time, i);
      console.log(`Lucky price: ${i}: `, luckyPrice);
    }
  }

  describe("Deployment", function () {
    it("Should set the right fee token", async function () {
      const { currency, toppSignalPool } = await loadFixture(
        deployToppSignalPool
      );

      const currencyAddress = await currency.getAddress();
      const toppSignalPoolCurrencyAddress = await toppSignalPool.currency();
      expect(currencyAddress.toLowerCase()).to.equal(
        toppSignalPoolCurrencyAddress.toLowerCase()
      );
    });
  });

  describe("Main Logics", function () {
    it("Should completely place bid", async function () {
      const { currency, toppSignalPool, signalTicket, ticketPrice, owner } =
        await loadFixture(deployToppSignalPool);

      const currencyDecimals = await currency.decimals();
      const mintAmount = hre.ethers.parseUnits("1000000", currencyDecimals);

      const time = await networkTime.latest();
      const price = "6000000";
      const amount = "10";

      const toppSignalPoolAddress = await toppSignalPool.getAddress();

      await currency.mint(owner.address, mintAmount);
      await currency.approve(toppSignalPoolAddress, hre.ethers.MaxUint256);

      await expect(toppSignalPool.placeBid(time, price, amount))
        .to.be.emit(toppSignalPool, "BidPlaced")
        .withArgs(time, price, owner.address, amount);

      // Check token balance
      const ownerBalance = await currency.balanceOf(owner.address);
      expect(ownerBalance).to.equal(mintAmount - BigInt(amount) * ticketPrice);

      // Check ticket weight
      const ticketWeight = await toppSignalPool.slotWeights(time, 0);
      expect(ticketWeight).to.equal(BigInt(amount));

      // Check slot rewards
      const slotReward = await toppSignalPool.slotReward(time);
      expect(slotReward).to.equal(BigInt(amount) * ticketPrice);

      // Check weights
      const slotWeight = await toppSignalPool.slotWeights(time, 0);
      expect(slotWeight).to.equal(BigInt(amount));

      // Check minted ticket
      const ticketId = combineNumbers(Number(time), Number(price));
      const ticketAmount = await signalTicket.balanceOf(
        owner.address,
        ticketId
      );
      expect(ticketAmount).to.equal(BigInt(amount));

      // Check bidded price
      const biddedPrice = await toppSignalPool.slotPrices(time, 0);
      expect(biddedPrice).to.equal(BigInt(price));
    });

    it("Should accumulates bids", async function () {
      const {
        currency,
        currencyDecimals,
        toppSignalPool,
        otherAccounts,
        ticketPrice,
      } = await loadFixture(deployToppSignalPool);

      const toppSignalPoolAddress = await toppSignalPool.getAddress();

      const mintAmount = hre.ethers.parseUnits("1000000", currencyDecimals);

      const time = await networkTime.latest();
      const prices = ["6000000", "6000000", "6000200", "6000300"];
      const amounts = ["10", "20", "10", "10"];

      for (let i = 0; i < prices.length; i++) {
        const price = prices[i];
        const amount = amounts[i];

        await currency.mint(otherAccounts[i].address, mintAmount);
        await currency
          .connect(otherAccounts[i])
          .approve(toppSignalPoolAddress, hre.ethers.MaxUint256);
        await toppSignalPool
          .connect(otherAccounts[i])
          .placeBid(time, price, amount);
      }

      const expectedWeights = ["30", "10", "10"];
      for (let i = 0; i < expectedWeights.length; i++) {
        const weight = await toppSignalPool.slotWeights(time, i);
        expect(weight).to.be.equal(expectedWeights[i]);
      }

      const expectedPrices = ["6000000", "6000200", "6000300"];
      for (let i = 0; i < expectedPrices.length; i++) {
        const price = await toppSignalPool.slotPrices(time, i);
        expect(price).to.be.equal(expectedPrices[i]);
      }

      const totalDeposit = amounts.reduce((prev, cur) => prev + Number(cur), 0);
      const expectedReward = BigInt(totalDeposit) * ticketPrice;
      const reward = await toppSignalPool.slotReward(time);
      expect(reward).to.be.equal(expectedReward);
    });

    it("Must be able to fulfill settlement during close status", async function () {
      const {
        toppSignalPool,
        priceOracle,
        randomOracle,
        time,
      } = await loadFixture(placeBids);

      const expectedExact = "6000000"; // 60000.00 (2 decimals)
      const expectedExactWeight = "10";

      const expectedClosest = ["6000100", "6000200", "6000300"];
      const expectedClosestWeights = ["30", "10", "10"];

      const expectedLucky = ["6000100", "6000200", "6000300"];
      const expectedLuckyWeight = ["30", "10", "10"];

      await toppSignalPool.settle(time);
      await priceOracle.fulfillPrice(time, expectedExact);
      await randomOracle.fulfillRandomness(time, [1, 2, 3]);

      const settledPrice = await toppSignalPool.settledExact(time);
      const settledExactWeight = await toppSignalPool.settledExactWeight(time);
      expect(expectedExact).to.equal(settledPrice);
      expect(expectedExactWeight).to.equal(settledExactWeight);

      for (let i = 0; i < 3; i++) {
        const settledClosest = await toppSignalPool.settledClosest(time, i);
        const settledClosestWeights =
          await toppSignalPool.settledClosestWeights(time, i);

        expect(expectedClosest[i]).to.equal(settledClosest);
        expect(expectedClosestWeights[i]).to.equal(settledClosestWeights);
      }

      for (let i = 0; i < 3; i++) {
        const settledLucky = await toppSignalPool.settledLucky(time, i);
        const settledLuckyWeights = await toppSignalPool.settledLuckyWeights(
          time,
          i
        );
        expect(expectedLucky[i]).to.equal(settledLucky);
        expect(expectedLuckyWeight[i]).to.equal(settledLuckyWeights);
      }
    });
  });
});
