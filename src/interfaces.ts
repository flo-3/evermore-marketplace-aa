// An individual item with a unique identifier.
// It corresponds to a NFT
export interface Item {
  tokenId: string;
  contractAddress: string;
  price: string;
  image_url: string;
  name: string;
  description: string;
  merchant: string;
  originalPrice: string;
  displayPrice: string;
}

export interface Listing {
  contractAddress: string;
  tokenId: string;
  price: string;
  seller: string;
  currentlyListed: boolean;
}

export interface ClaimParams {
  messageHash: string;
  signature: string;
  receiver: string;
  tokenId: string;
}
