import { useState, useEffect } from 'react';
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { ethers  } from 'ethers';
import { ChainId } from "@biconomy/core-types";
import { ParticleProvider } from "@biconomy/particle-auth";

import { particle } from "@/lib/particle";
import { paymaster, bundler } from "@/lib/biconomy";
import marketplaceABI from "@/lib/abi/marketplaceABI.json";
import { Listing, Item } from "@/interfaces";
import { getContract, getBalance } from "@/lib/contractUtils";

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
  const [buyableItems, setBuyableItems] = useState<Item[]>([]);
  const [claimableItems, setClaimableItems] = useState<Item[]>([]);

  useEffect(() => {
    const initPage = async () => {
      getClaimableItems();
      await getListedItems();
    }
    initPage();
  }, [])

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

  return (
    <MarketplaceLayout>
      <div className="float-right text-black">
          <div className="flex mt-4 mr-4 mb-0">
            {!loading && !address && <ConnectButton/>}
            {loading && <p>Loading your account...</p>}
            {address && <h2 className='m-4 text-black'>Welcome {email}!</h2>}
            {address && <LogoutButton/>}
          </div>
          <div className='ml-4 mt-0'>Your balance: {balance}</div>
        </div>
        <div className={styles.container}>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">1. Claim your Diagital Product Passport</h2>
        { claimableItems.length === 0 ? <p className="text-gray-800">No items listed yet!</p> :
          <ItemsGrid
          mode="claim"
          items={claimableItems}
          smartAccount={smartAccount}
          provider={provider as ethers.providers.Provider}
          address={address}
          />
        }
      </div>
      <div className={styles.container}>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Marketplace</h2>
        { buyableItems.length === 0 ? <p className="text-gray-800">No items listed yet!</p> :
          <ItemsGrid
          mode="buy"
          items={buyableItems}
          smartAccount={smartAccount}
          provider={provider as ethers.providers.Provider}
          address={address}
          />
        }
      </div>
    </MarketplaceLayout>
  )
}
