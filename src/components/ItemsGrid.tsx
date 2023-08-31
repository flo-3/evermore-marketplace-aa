import React, { useState } from "react";
import { ethers } from "ethers";

import ItemCard from "./ItemCard";
import { Item } from "@/interfaces";
import Cart from "@/components/Cart";


export default function ItemsGrid(
{
    items,
    smartAccount,
    provider,
    address,
    mode
    } :
    {
    items: Item[],
    smartAccount: any, 
    provider: ethers.providers.Provider
    address: string,
    mode: string
    })
{
    const [cartItems, setCartItems] = useState<Item[]>([]);

    const addToCart = (item: Item) => {
        setCartItems((prevItems) => [...prevItems, item]);
    };

    const removeFromCart = (item: Item) => {
        setCartItems((prevItems) => prevItems.filter((i) => i !== item));
    };

    return (
        <div className="">
            <div className="flex justify-center items-center">
                <div className="2xl:mx-auto 2xl:container px-4 sm:px-6 xl:px-20 2xl:px-0 w-full">
                    <div className="flex flex-col jusitfy-center items-center space-y-10">
                        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            { items.slice().reverse().map((item, index) => {
                                return (
                                    <div key={index}>
                                        <ItemCard
                                            mode={mode}
                                            item={item}
                                            smartAccount={smartAccount}
                                            provider={provider}
                                            address={address}
                                            addToCart={addToCart}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {
                    (mode === "buy") &&
                    <Cart items={cartItems} removeFromCart={removeFromCart} smartAccount={smartAccount} provider={provider} address={address} />
                }

            </div>
        </div>
    );
}
