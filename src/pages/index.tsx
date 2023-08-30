import styles from "@/styles/Home.module.css";

import MarketplaceLayout from '@/components/layout/MarketplaceLayout';
import ItemsGrid from '@/components/ItemsGrid';

// TODO: read from the marketplace to get the list of items available for sale
const items = [
  {
      "contractAddress": "",
      "tokenId": "2",
      "price": "60",
      "name": "",
      "image_url": '',
      "nextAvailable": "3"
  },
  {
      "contractAddress": "",
      "tokenId": "1",
      "price": "739",
      "name": "",
      "image_url": '',
      "nextAvailable": "2"
  },
  {
      "contractAddress": "",
      "tokenId": "1",
      "price": "195",
      "name": "",
      "image_url": '',
      "nextAvailable": "3"
  },
  {
      "contractAddress": "",
      "tokenId": "3",
      "price": "250",
      "name": "",
      "image_url": '',
      "nextAvailable": "4"
  },
]

export default function Home() {
  return (
    <MarketplaceLayout>
      <div className={styles.container}>
        <ItemsGrid items={items}/>
      </div>
    </MarketplaceLayout>
  )
}
