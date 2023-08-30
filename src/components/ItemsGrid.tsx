import React, { useState } from "react";

import ItemCard from "./ItemCard";
import { Item } from "@/interfaces";


export default function ItemsGrid( {items} : {items: Item[] }){
    return (
        <div className="">
            <div className="flex justify-center items-center">
                <div className="2xl:mx-auto 2xl:container px-4 sm:px-6 xl:px-20 2xl:px-0 w-full">
                    <div className="flex flex-col jusitfy-center items-center space-y-10">
                        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            { items.map((item, index) => {
                                return (
                                    <div key={index}>
                                        <ItemCard
                                            item={item}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
