import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import nftABI from "@/lib/abi/nftABI.json";
import { 
  IHybridPaymaster, 
  SponsorUserOperationDto,
  PaymasterMode
} from '@biconomy/paymaster';
import { BiconomySmartAccount } from "@biconomy/account";
import { ClaimParams } from '@/interfaces';
import { getClaimParams } from '@/lib/contractUtils';


interface Props {
  smartAccount: BiconomySmartAccount,
  address: string,
  provider: ethers.providers.Provider,
  nftAddress: string,
  tokenId: string | undefined,
}

const ClaimButton: React.FC<Props> = ({ smartAccount, address, provider, nftAddress, tokenId }) => {

  const [claimParams, setClaimParams] = useState<ClaimParams>();  // Smart contract has a allowlist system base on message signature
  const [minted, setMinted] = useState<boolean>(false);
  const [minting, setMinting] = useState<boolean>(false);

  useEffect(() => {
    const initClaimParams = async () => {
      if (!tokenId) {
        return;
      }
      const claimParams = await getClaimParams(address, tokenId);
      setClaimParams(claimParams);
    }
    if (tokenId) {
      initClaimParams();
    }
  }, [tokenId])

  const handleMint = async () => {
    if (!claimParams) {
      console.log('No claim params');
      return;
    }
    setMinting(true);
    const contract = new ethers.Contract(
      nftAddress,
      nftABI,
      provider,
    )
    try {
      const minTx = await contract.populateTransaction.claim(address, tokenId, claimParams.messageHash, claimParams.signature);
      console.log(minTx.data);
      const tx1 = {
        to: nftAddress,
        data: minTx.data,
      };
      let userOp = await smartAccount.buildUserOp([tx1]);
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
      setMinting(false);
      setMinted(true);
    } catch (err: any) {
      console.error(err);
      console.log(err)
      setMinting(false);
    }
  }

  return(
    <>
      <div className='text-black w-full text-center'>
      { address && !minted && !minting && <button onClick={handleMint} className="btn btn-blue w-full" disabled={!tokenId}>Claim your item for free! Number {tokenId}</button> }
      { address && minted && !minting && <span className='w-full'>Congratulations! You now own the item {tokenId}!</span> }
      { address && minting && <span className='w-full'>Claiming...</span> }
      </div>
    </>
  )
}

export default ClaimButton;