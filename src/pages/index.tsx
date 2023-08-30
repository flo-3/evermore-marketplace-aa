import { useState } from 'react';
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { ethers  } from 'ethers';
import { ChainId } from "@biconomy/core-types";
import { ParticleProvider } from "@biconomy/particle-auth";

import { particle } from "@/lib/particle";
import { paymaster, bundler } from "@/lib/biconomy";
import { Item } from "@/interfaces";

import styles from "@/styles/Home.module.css";

import MarketplaceLayout from '@/components/layout/MarketplaceLayout';
import ItemsGrid from '@/components/ItemsGrid';


export default function Home() {

  const [address, setAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
  const [items, setItems] = useState<Item[]>([]);

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
      setProvider(web3Provider)
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster
      }
      let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
      biconomySmartAccount =  await biconomySmartAccount.init()
      setAddress( await biconomySmartAccount.getSmartAccountAddress())
      setSmartAccount(biconomySmartAccount)
      setLoading(false)
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
      <div className="float-right flex m-4">
          {!loading && !address && <ConnectButton/>}
          {loading && <p>Loading your account...</p>}
          {address && <h2 className='m-4 text-black'>Welcome {email}!</h2>}
          {address && <LogoutButton/>}
        </div>
      <div className={styles.container}>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Marketplace</h2>
        { items.length === 0 ? <p className="text-gray-800">No items listed yet!</p> : <ItemsGrid items={items}/>}
      </div>
    </MarketplaceLayout>
  )
}
