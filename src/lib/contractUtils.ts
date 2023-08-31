import { ethers } from "ethers";

const mumbaiBaseURL = "https://polygon-mumbai.g.alchemy.com";
const mumbaiRPC = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;
export const mumbaiProvider = new ethers.providers.JsonRpcProvider(mumbaiRPC, { chainId: 80001, name: "polygon-mumbai" });

export function getContract(address: string, abi: any, provider: ethers.providers.Provider = mumbaiProvider) {
  return new ethers.Contract(address, abi, mumbaiProvider);
}

export async function getBalance(address: string, provider: ethers.providers.Provider = mumbaiProvider) {
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

function createClaimMessageHash(receiver: string, tokenId: string) {
  const message = ethers.utils.solidityKeccak256(
    ['address', 'uint256'],
    [receiver, tokenId]
  );
  return ethers.utils.id(message);
}

async function signMessage(messageHash: string, privateKey: string) {
  const wallet = new ethers.Wallet(privateKey);
  const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
  return signature;
}

export async function getClaimParams(wallet: string, tokenId: string) {
  console.log(wallet, tokenId);
  const messageHash = createClaimMessageHash(wallet, tokenId);
  const signature = await signMessage(messageHash, process.env.NEXT_PUBLIC_SIGNER_PRIVATE_KEY as string);
  const claimParams = {
    messageHash: messageHash,
    signature: signature,
    receiver: wallet,
    tokenId: tokenId
  };
  return claimParams;
}

export async function getWalletNFTs(wallet: string) {
  if (!wallet) {
    return [];
  }
  try {
    const options = {method: 'GET', headers: {accept: 'application/json'}};
    const response = await fetch(
      `${mumbaiBaseURL}/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTsForOwner?owner=${wallet}&withMetadata=true&pageSize=100`,
      options
      );
    const json = await response.json();
    return json.ownedNfts;
  } catch (error) {
    throw error;
  }
}