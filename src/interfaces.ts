// An individual item with a unique identifier.
// It corresponds to a NFT
export interface Item {
  tokenId: string;
  contractAddress: string;
  price: string;
  image_url: string;
  name: string;
  nextAvailable: string;
}
