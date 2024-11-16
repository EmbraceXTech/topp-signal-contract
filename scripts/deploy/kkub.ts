import hre from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  // Deploy KKUB contract
  const KKUB = await hre.ethers.getContractFactory("KKUB");

  // Contract parameters
  const kyc = "0x99166455989a868d5151799c716B3c1Be95D5114"; // TODO: Set KYC contract address
  const adminProjectRouter = "0x0Fe7773B44b2CFE4C9778616Db526359Ccda16bE"; // TODO: Set admin project router address
  const committee = signer.address; // TODO: Set committee address
  const transferRouter = "0xe23fbAd6E1b18258AE1a964E17b1908e0690DdD4"; // TODO: Set transfer router address
  const acceptedKYCLevel = 0; // TODO: Set accepted KYC level

  const kkub = await KKUB.deploy(
    kyc,
    adminProjectRouter,
    committee,
    transferRouter,
    acceptedKYCLevel
  );

  const address = await kkub.getAddress();
  await saveDeployedAddress("KKUB", address);

  console.log(`KKUB deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
