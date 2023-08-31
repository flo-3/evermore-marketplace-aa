import React from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { BiconomySmartAccount } from "@biconomy/account";

import { Item } from '../interfaces';
import { getContract } from '@/lib/contractUtils';

import marketplaceABI from "@/lib/abi/marketplaceABI.json";
import { DEFAULT_RESELL_PRICE } from '@/globals';


interface CartProps {
  items: Item[];
  removeFromCart: (item: Item) => void;
  smartAccount: BiconomySmartAccount,
  address: string,
  provider: ethers.providers.Provider
}

const Cart: React.FC<CartProps> = ({ items, removeFromCart, smartAccount, address, provider }) => {

  const totalPrice = items.reduce((acc, item) => acc + parseFloat(item.displayPrice), 0);
  const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as string;
  const marketplaceContract = getContract(marketplaceAddress, marketplaceABI, provider);

  const [buying, setBuying] = useState<boolean>(false);
  const [bought, setBought] = useState<boolean>(false);

  async function handleBuyAll() {
    if (!marketplaceContract || !items) {
      return;
    }
    
    try {
      setBuying(true);
      const promises = items.map(async (item) => {
        const tx = await marketplaceContract.populateTransaction.buyItem(item.contractAddress, item.tokenId, {
          value: ethers.utils.parseEther(item.price)
        });
        return tx;
      });
      const txs = await Promise.all(promises);
      let tansactions: any[] = txs.map(tx => {
        return {
          to: marketplaceAddress,
          data: tx.data,
        }
      });
      const userOp = await smartAccount.buildUserOp(tansactions);

      // Operation not sponsored as the user already spend money to buy the items
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      setBuying(false);
      setBought(true);
    } catch (e) {
      console.log(e);
      setBuying(false);
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md fixed right-4 top-[150px] text-black">
      <h2 className="text-xl font-semibold mb-4">Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="mb-4">
            {items.map((item) => (
              <li key={`${item.contractAddress}-${item.tokenId}`}>
                {item.name} - ${item.displayPrice}
                <button
                  className="ml-2 text-sm"
                  onClick={() => removeFromCart(item)}
                > X </button>
              </li>
            ))}
          </ul>
          <p className="font-semibold">Total: ${totalPrice}</p>
          <button
            className="btn btn-black mt-4"
            onClick={() => handleBuyAll()}
            disabled={buying || bought || items.length === 0 || !address}
          >
            { buying ? "Buying..." : "Buy All"}
          </button>
          {
            bought &&
            <p className="text-green-500 mt-2">Congratulations! You now own these items</p>
          }
          {
            !address &&
            <p className="text-red-500 mt-2">Please login to buy these items</p>
          }
        </>
      )}
    </div>
  );
};

export default Cart;
