import fs from "fs";
import path from "path";

export async function saveDeployedAddress(
  contractName: string,
  address: string
) {
  const deploymentsDir = path.join(__dirname, "../deployments");

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filePath = path.join(deploymentsDir, `${contractName}.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        address,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
}
