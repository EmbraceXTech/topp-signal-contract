import { readFileSync } from 'fs';
import { join } from 'path';

export async function readDeployedAddress(contractName: string): Promise<string> {
  const filePath = join(process.cwd(), 'deployments', `${contractName}.json`);
  const fileContent = readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent).address;
}
