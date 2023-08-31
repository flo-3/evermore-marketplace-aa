## Table of Contents

-   [About Evermore](#about)
-   [Installation](#installation)
-   [Usage](#usage)

## About
Evermore builds infrastructure for circular business models.

We do so by tokenizing physical consumer products, leveraging NFTs and smart contracts to decrease friction in resale, and creating additional revenue streams through royalties.

Using revenue incentives to lay the groundwork for a more fundamental shift on how products are designed and their circularity.

We solve for the unsustainable linear economy by using NFT royalties to create revenue for consumer product companies from re-sales,incentivising them to design more durable products and decrease demand on new materials.

Evermore is built on the Polygon Blockchain.

> Checkout our open source smart contracts : [here](https://github.com/Evermorelab/evermore-marketplace-solidity-sc)


### Key features
This repository is a sub-project of Evermore, aimed to showcase the use of Account Abstraction and ERC-4337 to enhance user experience (UX) and create a seamless environment for non-web3 users.


#### 1. Email-Based Login
Problem: Evermore customers receiving physical items need a smooth onboarding process into the web3 world without the hassle of managing wallets.

Solution: We've implemented an email-based login system. When customers login on the platform to claim their NFT, we automatically generate a wallet for them and link it to their email address using Particle (check out lib/particle.ts and the login process in pages/index.tsx for implementation details). Additionally, we associate a smart wallet using Biconomy's Account Abstraction SDK, eliminating the need for customers to worry about gas fees and enabling transaction bundling for efficiency. Checkout the Biconomy SDK integration in lib/biconomy.ts.

#### 2. Gas-Free NFT Claiming
Problem: Customers shouldn't be required to have tokens in their wallet to claim their NFT, as it is there first web3 operation.

Solution: We've implemented a seamless NFT claiming process levraging Account Abstraction paymaster capacity. Customers can immediately claim their NFT without any tokens in their wallet. For more details, refer to the ClaimButton components in src/components/ClaimButton.tsx.

#### 3. Seamless NFT Resale
Problem: Customers shouldn't hesitate to resell their items due to associated costs or tidious process.

Solution: We sponsor the cost of reselling NFTs for our customers, ensuring they don't incur any expenses. Additionally, we streamline the process by combining marketplace approval and listing into a single transaction. Explore the ResellButton component for the technical implementation in src/compoments/ResellButton.tsx.

#### 4. Multi-Item Checkout
Problem: We aim to recreate a traditional Web2 marketplace experience for our customers.

Solution: To replicate the familiar experience of shopping for multiple items in one go, we've implemented a multi-item checkout system using transaction bundling. For detailed insights, checkout into the Cart component in src/compomemts/Cart.tsx.


### Next steps
- Integrate this project with the main Evermore marketplace
- Adding credit card payments to the checkout flow

## Installation

### Prerequisites

This project is a Next.js app working with the Polygon Mumbai testnet. To run it locally, you'll need the following:
- Node.js
- Yarn (or npm)
- Alchemy API key (for Polygon Mumbai testnet) - [get one here](https://dashboard.alchemyapi.com/)
- Biconomy Bunler key - [get one here](https://dashboard.biconomy.io/). Make sure you create a paymaster contract for the Polygon Mumbai testnet with enough tokens to sponsor the transactions and whitelist the NFT and Marketplace contracts.
- Particle API key - [get one here](https://dashboard.particle.io/login)

### Steps
1. Clone the repository
2. Install dependencies
```bash
yarn install
```
3. Create a .env.local file in the root directory by copying the .env.example file and filling in the required values

### Usage

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

