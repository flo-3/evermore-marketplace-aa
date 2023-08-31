import React, { useState, useEffect } from "react";
import nftABI from "@/lib/abi/nftABI.json";
import { getContract } from "@/lib/contractUtils";
import { ethers } from "ethers";
import { BiconomySmartAccount } from "@biconomy/account";

import Image from 'next/image';
import { Item } from "@/interfaces";
import Badge from '@/components/ui';
import ClaimButton from '@/components/ClaimButton';
import ResellButton from "@/components/ResellButton";

interface Props {
  item: Item,
  smartAccount: BiconomySmartAccount,
  provider: ethers.providers.Provider,
  address: string,
  mode: string,
  addToCart: (item: Item) => void,
}


const ItemCard: React.FC<Props> = (
  {
    item,
    smartAccount,
    provider,
    address,
    mode,
    addToCart
  }) =>
{
  const [cardItem, setCardItem] = useState<Item>();
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [claimTokenId, setClaimTokenId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getItemAttributes = async () => {
      try{
        const contract = getContract(item.contractAddress, nftABI);
        const tokenURI = await contract.tokenURI(item.tokenId);
        // replace ipfs:// with https://ipfs.io/ipfs/
        if (!tokenURI.startsWith("ipfs://")) {
          console.log("Invalid tokenURI", tokenURI, item.tokenId);
          return;
        }
        const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(url);
        const data = await response.json();
        item.name = data.name;
        item.image_url = data.image;
        item.originalPrice = data.original_price;
        item.merchant = data.merchant;
        item.description = data.description;
        setCardItem(item);
      } catch (e) {
        console.log(e);
      }
    }

    const getTotalSupply = async () => {
      try{
        const contract = getContract(item.contractAddress, nftABI);
        const totalSupply = await contract.itemSupply();
        setTotalSupply(Number(totalSupply));
      } catch (e) {
        console.log(e);
      }
    }

    const initPage = async () => {
      await getItemAttributes();
      await getTotalSupply();
    }

    initPage();
  }, [])

   // swtich for item status according to mode
   let itemStatus: string | undefined;
   switch (mode) {
     case "claim":
       itemStatus = "NEW";
       break;
     case "buy":
       itemStatus = "RESALE";
       break;
     case "manage":
       itemStatus = undefined;
       break;
     default:
       itemStatus = undefined;
   }

  const actions = (
    <>
      { (address && mode === "claim") &&
      <>
        {/* Input to enter the token id */}
        <div className="flex justify-center items-center">
          <div className="flex justify-center items-center">
            <input
            className="w-24 h-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 px-2 text-center text-black my-2"
            type="number"
            placeholder="Token ID"
            onChange={(e) => {
              setClaimTokenId(e.target.value);
            }}
            />
          </div>
        </div>
        <ClaimButton
          smartAccount={smartAccount}
          address={address}
          provider={provider}
          nftAddress={cardItem?.contractAddress as string}
          tokenId={claimTokenId}
        />
        </>
      }
      { (address && mode === "manage") &&
        <ResellButton
          smartAccount={smartAccount}
          address={address}
          provider={provider}
          nftAddress={cardItem?.contractAddress as string}
          tokenId={item.tokenId}
        />
      }
      {
        (mode === "buy") &&
        <button
          className="btn btn-blue w-full"
          onClick={() => addToCart(item)}
        > Add to Cart
        </button>
      }
    </>
  );

  return (
    <>
      {
        cardItem &&
        <div className="relative max-w-sm bg-white shadow-md rounded-3xl p-2 mx-1 my-3 cursor-pointer text-left">
          <div className="overflow-x-hidden rounded-2xl relative">
            <Image className="h-80 rounded-2xl w-full object-cover" src={cardItem.image_url} width="800" height="800" alt={cardItem.name}/>
            { (itemStatus) &&
              <Badge color='secondary' className="absolute right-2 top-2">{itemStatus.toUpperCase()}</Badge>
            }
          </div>
          <div className="mt-4 pl-2 mb-2 flex justify-between ">
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-0  min-h-[60px]">{cardItem.name}</p>
              {
                (mode === "buy") &&
                <p className="text-md text-gray-800 mt-0"> <span className="line-through">$ {cardItem.originalPrice}</span> $ {item.displayPrice}</p>
              }
            </div>
          </div>
          <div className="">
            {actions}
          </div>
        </div>
      }
    </>
  );
}

export default ItemCard;