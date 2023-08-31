import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BiconomySmartAccount, BiconomySmartAccountConfig } from "@biconomy/account";
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
import Logo from "/public/logo.png";


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
  const [section, setSection] = useState<number>(1);

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

  const handleSectionSelect = (section: number) => {
    setSection(section);
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
  const NFTSection = ({ mode, items, title, reloadFunction } : { mode: string, items: Item[] | undefined, title: string, reloadFunction: Function }) => {
    return (
      <div className={styles.container}>
        <div className="flex justify-between">
        <h2 className="text-3xl font-semibold text-gray-800 mb-12">{title}</h2>
        <button onClick={() => handleSectionReload(reloadFunction)} className="btn text-black mt-[-50px]">
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

  const NavTabs = () => {
    let defaultClass = "inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group";
    let activeClass = "inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group";
    let defaultIconClass = "w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300";
    let activeIconClass = "w-4 h-4 mr-2 text-blue-600 dark:text-blue-500";
    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
              <li className="mr-2">
                  <button onClick={() => handleSectionSelect(1)} className={section === 1 ? activeClass : defaultClass}>
                  <svg className={section === 1 ? activeIconClass : defaultIconClass}  aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
                </svg>Claim
                  </button>
              </li>
              <li className="mr-2">
                  <button onClick={() => handleSectionSelect(2)}  className={section === 2 ? activeClass : defaultClass}>
                      <svg className={section === 2 ? activeIconClass : defaultIconClass} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                          <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                      </svg>Your inventory
                  </button>
              </li>
              <li className="mr-2">
                  <button onClick={() => handleSectionSelect(3)}  className={section === 3 ? activeClass : defaultClass}>
                      <svg className={section === 3 ? activeIconClass : defaultIconClass}  aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.243 3.243 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.227 3.227 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.243 3.243 0 0 0 2.25-3.076Zm-6-9A3.243 3.243 0 0 0 11 2.424V1a1 1 0 0 0-2 0v1.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0V8.576A3.243 3.243 0 0 0 13.25 5.5Z"/>
                      </svg>Marketplace
                  </button>
              </li>
          </ul>
      </div>
    )}

  const Header = () => {
    return (
      <header id="header" className="bg-gray-50">
        <div className="flex justify-between items-start py-6 px-2 md:px-4 lg:px-10 w-full">
          <Link href="/">
            <Image src={Logo} alt="Evermore logo" className="w-20" priority/>
          </Link>
          <NavTabs/>
          <div className="float-right text-black">
            <div className="flex mr-4 mb-0">
              {!loading && !address && <ConnectButton/>}
              {loading && <p>Loading your account...</p>}
              {address && <h2 className='m-4 text-black'>Welcome {email}!</h2>}
              {address && <LogoutButton/>}
            </div>
            { address && <div className='ml-4 mt-0'>Your balance: {balance}</div> }
          </div>
        </div>
      </header>
    )
  }

  return (
    <MarketplaceLayout>
      <Header/>
      <div className=''>
        {
          section === 1 &&
          <NFTSection mode="claim" items={claimableItems} title="Claim your Diagital Product Passport" reloadFunction={getClaimableItems}/>
        }
        {
          section === 2 && address &&
          <NFTSection mode="manage" items={userItems} title="Resale the items you do not need anymore" reloadFunction={getUserItems}/>
        }
        {
          section === 2 && !address &&
              <div className={styles.container}>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Resale the items you do not need anymore</h2>
                <p className="text-gray-800">Login to sell your items</p>
              </div>
        }
        {
          section === 3 && <NFTSection mode="buy" items={buyableItems} title="Buy preloved items" reloadFunction={getListedItems}/>
        }

      </div>
    </MarketplaceLayout>
  )
}
