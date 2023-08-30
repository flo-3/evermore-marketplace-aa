import { ethers } from "ethers";

const polygonRPC = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
export const mumbaiProvider = new ethers.providers.JsonRpcProvider(polygonRPC, { chainId: 80001, name: "polygon-mumbai" });