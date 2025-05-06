import { Graph } from "@graphprotocol/grc-20";

export async function createSpace(
  editorAddress: string,
  name: string,
  network: "TESTNET" | "MAINNET"
) {
  const spaceData = await Graph.createSpace({
    editorAddress,
    name,
    network,
  });
  console.log(`Space deployed with ID: ${spaceData.id}`);
  return spaceData;
}
