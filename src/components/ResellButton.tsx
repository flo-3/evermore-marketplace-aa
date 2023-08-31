import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { 
  IHybridPaymaster, 
  SponsorUserOperationDto,
  PaymasterMode
} from '@biconomy/paymaster';
import { BiconomySmartAccount } from "@biconomy/account";

import { getContract } from '@/lib/contractUtils';
import { DEFAULT_RESELL_PRICE } from '@/globals';
import nftABI from "@/lib/abi/nftABI.json";
import marketplaceABI from "@/lib/abi/marketplaceABI.json";


interface Props {
  smartAccount: BiconomySmartAccount,
  address: string,
  provider: ethers.providers.Provider,
  nftAddress: string,
  tokenId: string | undefined,
}

const ResellButton: React.FC<Props> = ({ smartAccount, address, provider, nftAddress, tokenId }) => {

  const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as string;
  const NFTcontract = getContract(nftAddress, nftABI, provider);
  const MarketplaceContract = getContract(marketplaceAddress, marketplaceABI, provider);
  const [listed, setListed] = useState<boolean>(false);
  const [listing, setListing] = useState<boolean>(false);

  const handleResell = async () => {
    setListing(true);
    try {
      // Approve marketplace to sell the NFT
      const approveTx = await NFTcontract.populateTransaction.approve(marketplaceAddress, tokenId);
      console.log(approveTx.data);
      const tx1 = {
        to: nftAddress,
        data: approveTx.data,
      };
      // List the NFT on the marketplace
      // keep resale price super low for demo purpose
      const listTx = await MarketplaceContract.populateTransaction.listItem(nftAddress, tokenId, ethers.utils.parseEther(DEFAULT_RESELL_PRICE));
      console.log(listTx.data);
      const tx2 = {
        to: marketplaceAddress,
        data: listTx.data,
      };
      // Bundle the two transactions into a user operation
      let userOp = await smartAccount.buildUserOp([tx1, tx2]);
      console.log({ userOp })
      const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
      };
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );
        
      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      setListing(false);
      setListed(true);
    } catch (err: any) {
      console.error(err);
      console.log(err)
      setListing(false);
    }
  }

  return(
    <>
      <div className='text-black w-full text-center'>
      { address && !listed && !listing && <button onClick={handleResell} className="btn btn-blue w-full" disabled={!tokenId}>List your item for sell</button> }
      { address && listed && !listing && <span className='w-full'>Your item is listed on our marketplace!</span> }
      { address && listing && <span className='w-full'>Listing...</span> }
      </div>
    </>
  )
}

export default ResellButton;