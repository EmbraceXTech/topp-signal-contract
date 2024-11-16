import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("TestPriceOracleCaller", function () {
  async function deployPriceOracleCaller() {
    const [owner, ...otherAccounts] = await hre.ethers.getSigners();

    const SimplePriceOracle = await hre.ethers.getContractFactory("SimplePriceOracle");
    const simplePriceOracle = await SimplePriceOracle.deploy();

    const TestPriceOracleCaller = await hre.ethers.getContractFactory("TestPriceOracleCaller");
    const priceOracleCaller = await TestPriceOracleCaller.deploy(await simplePriceOracle.getAddress());

    await simplePriceOracle.setCaller(await priceOracleCaller.getAddress());

    return {
    simplePriceOracle,
      priceOracleCaller,
      owner,
      otherAccounts
    };
  }
  describe("Deployment", function () {
    it("Should set the correct oracle address", async function () {
      const { simplePriceOracle, priceOracleCaller } = await loadFixture(deployPriceOracleCaller);

      const oracleAddress = await simplePriceOracle.getAddress();
      const callerOracleAddress = await priceOracleCaller.oracle();
      
      expect(oracleAddress.toLowerCase()).to.equal(callerOracleAddress.toLowerCase());
    });
  });

  describe("Main Logic", function () {
    it("Should request and receive price", async function () {
      const { simplePriceOracle, priceOracleCaller } = await loadFixture(deployPriceOracleCaller);

      const time = Math.floor(Date.now() / 1000);
      const price = "6000000";

      await priceOracleCaller.requestPrice(time);
      await simplePriceOracle.fulfillPrice(time, price);

      const lastTime = await priceOracleCaller.lastTime();
      const lastPrice = await priceOracleCaller.lastPrice();

      expect(lastTime).to.equal(time);
      expect(lastPrice).to.equal(price);
    });

    it("Should only allow oracle to fulfill price", async function () {
      const { priceOracleCaller, otherAccounts } = await loadFixture(deployPriceOracleCaller);

      const time = Math.floor(Date.now() / 1000);
      const price = "6000000";

      await expect(
        priceOracleCaller.connect(otherAccounts[0]).fulfillPrice(time, price)
      ).to.be.revertedWith("Only oracle can fulfill");
    });

    it("Should allow setting new oracle address", async function () {
      const { priceOracleCaller, otherAccounts } = await loadFixture(deployPriceOracleCaller);

      const newOracleAddress = otherAccounts[0].address;
      await priceOracleCaller.setOracle(newOracleAddress);

      const oracleAddress = await priceOracleCaller.oracle();
      expect(oracleAddress.toLowerCase()).to.equal(newOracleAddress.toLowerCase());
    });
  });
});