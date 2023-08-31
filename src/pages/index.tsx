import { useState, useEffect } from 'react';
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { ethers  } from 'ethers';
import { ChainId } from "@biconomy/core-types";
import { ParticleProvider } from "@biconomy/particle-auth";

import { particle } from "@/lib/particle";
import { paymaster, bundler } from "@/lib/biconomy";
import marketplaceABI from "@/lib/abi/marketplaceABI.json";
import { Listing, Item } from "@/interfaces";
import { getContract, getBalance, getWalletNFTs } from "@/lib/contractUtils";

import styles from "@/styles/Home.module.css";

import MarketplaceLayout from '@/components/layout/MarketplaceLayout';
import ItemsGrid from '@/components/ItemsGrid';


// TODO: get from DB or from SC
const availableSCs = [
  "0x1677b439498889b454bcb75fd9f0dd5f75383cf2",
  "0xa7CC74ff0725a39b7498d436b89f792053999AeA",
  "0xd3c2f080e69ce50f6f0bcaca45cacb50afb6d555"
]


export default function Home() {

  const [address, setAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
  const [buyableItems, setBuyableItems] = useState<Item[]>();
  const [claimableItems, setClaimableItems] = useState<Item[]>();
  const [userItems, setUserItems] = useState<Item[]>();

  useEffect(() => {
    const initPage = async () => {
      if (!claimableItems) {
        getClaimableItems();
      }
      if (!userItems && address) {
        getUserItems();
      }
      if (!buyableItems) {
        await getListedItems();
      }
    }
    initPage();
  }, [address])

  const getClaimableItems = () => {
    const items: Item[] = availableSCs.map((sc) => {
      return {
        contractAddress: sc,
        tokenId: '1', // set default value to charge the metadata. The tokenId to be claimed is set in the claim function
        price: '',
        name: '',
        image_url: '',
        originalPrice: '',
        merchant: '',
        description: '',
      }
    });
    setClaimableItems(items);
  }

  const getUserItems = async () => {
    if (!address) {
      return;
    }
    const nfts = await getWalletNFTs(address);
    const items: Item[] = nfts.map((nft: any) => {
      return {
        contractAddress: nft.contract.address,
        tokenId: nft.tokenId,
        price: '',
        name: '',
        image_url: '',
        originalPrice: '',
        merchant: '',
        description: '',
      }
    });
    setUserItems(items);
  }

  const getListedItems = async () => {
    const contract = getContract(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as string, marketplaceABI);
    const listings: Listing[] = await contract.fetchListedItems();
    // Transform the listings into items
    const items: Item[] = listings.map((listing) => {
      let price = Number(listing.price) / 10 ** 18;
      return {
        contractAddress: listing.contractAddress,
        tokenId: Number(listing.tokenId).toString(),
        price: (price * 100000).toString(),  // super small default price ATM, make it more real
        name: "",
        image_url: '',
        originalPrice: '',
        merchant: '',
        description: '',
      }
    });
    setBuyableItems(items);
  }

  const connect = async () => {
    try {
      setLoading(true)
      const userInfo = await particle.auth.login();
      setEmail(userInfo.email as string);
      console.log("Logged in user:", userInfo);
      const particleProvider = new ParticleProvider(particle.auth);
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );
      setProvider(web3Provider);
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster
      };
      let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
      biconomySmartAccount =  await biconomySmartAccount.init();
      const address = await biconomySmartAccount.getSmartAccountAddress();
      setAddress(address);
      setBalance(await getBalance(address));
      setSmartAccount(biconomySmartAccount);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await particle.auth.logout();
      setAddress("");
      setEmail("");
      setSmartAccount(null);
      setProvider(null);
      setLoading(false);
    } catch (error) {

    }
  }

  const handleSectionReload = async (reloadFunction: Function) => {
    await reloadFunction();
  }

  // Connect button component
  const ConnectButton = () => {
    return (
      <button onClick={connect} className="btn-blue btn">Login</button>
    )
  }

  // Logout button component
  const LogoutButton = () => {
    return (
      <button onClick={logout} className="btn-blue btn">Logout</button>
    )
  }

  // Section component
  const NFTSection = ({ mode, items, title, reloadFunction }  : { mode: string, items: Item[] | undefined, title: string, reloadFunction: Function }) => {
    return (
      <div className={styles.container}>
        <div className="flex justify-between">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">{title}</h2>
        <button onClick={() => handleSectionReload(reloadFunction)} className="btn text-black mt-[-20px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
          </svg>
        </button>
        </div>
        { !items || items.length === 0 ? <p className="text-gray-800">No items listed yet!</p> :
          <ItemsGrid
          mode={mode}
          items={items}
          smartAccount={smartAccount}
          provider={provider as ethers.providers.Provider}
          address={address}
          />
        }
      </div>
    )
  }

  return (
    <MarketplaceLayout>
      <div className="float-right text-black">
          <div className="flex mt-4 mr-4 mb-0">
            {!loading && !address && <ConnectButton/>}
            {loading && <p>Loading your account...</p>}
            {address && <h2 className='m-4 text-black'>Welcome {email}!</h2>}
            {address && <LogoutButton/>}
          </div>
          { address && <div className='ml-4 mt-0'>Your balance: {balance}</div> }
        </div>
        <NFTSection mode="claim" items={claimableItems} title="1. Claim your Diagital Product Passport" reloadFunction={getClaimableItems}/>
        { address ?
          <NFTSection mode="manage" items={userItems} title="2. Resale the items you do not need anymore" reloadFunction={getUserItems}/>
          :
          <div className={styles.container}>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">2. Resale the items you do not need anymore</h2>
            <p className="text-gray-800">Login to sell your items</p>
          </div>
        }
        <NFTSection mode="buy" items={buyableItems} title="3. Buy preloved items" reloadFunction={getListedItems}/>
    </MarketplaceLayout>
  )
}
