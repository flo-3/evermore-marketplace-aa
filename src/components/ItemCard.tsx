import { useState, useEffect } from "react";
import nftABI from "@/lib/abi/nftABI.json";
import { getContract } from "@/lib/contractUtils";
import { ethers } from "ethers";

import Image from 'next/image';
import { Item } from "@/interfaces";
import Badge from '@/components/ui';
import ClaimButton from '@/components/ClaimButton';


export default function ItemCard(
  {
    item,
    smartAccount,
    provider,
    address
  } :
  {
    item: Item,
    smartAccount: any, 
    provider: ethers.providers.Provider
    address: string
  })
{
  const [cardItem, setCardItem] = useState<Item>();
  const [totalSupply, setTotalSupply] = useState<number>(0);

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

  const actions = (
    <>
      { (address) &&
      <ClaimButton
        smartAccount={smartAccount}
        address={address}
        provider={provider}
        nftAddress={cardItem?.contractAddress as string}
        tokenId={"10"}
      /> }
    </>
  );

  const itemStatus = "RESELL"

  return (
    <>
      {
        cardItem &&
        <div className="relative max-w-sm bg-white shadow-md rounded-3xl p-2 mx-1 my-3 cursor-pointer text-left">
          <div className="overflow-x-hidden rounded-2xl relative">
            <Image className="h-80 rounded-2xl w-full object-cover" src={cardItem.image_url} width="800" height="800" alt={cardItem.name}/>
            <Badge color='secondary' className="absolute right-2 top-2">{itemStatus.toUpperCase()}</Badge>
          </div>
          <div className="mt-4 pl-2 mb-2 flex justify-between ">
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-0  min-h-[60px]">{cardItem.name}</p>
              <p className="text-md text-gray-800 mt-0"> <span className="line-through">$ {cardItem.originalPrice}</span> $ {cardItem.price}</p>
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
