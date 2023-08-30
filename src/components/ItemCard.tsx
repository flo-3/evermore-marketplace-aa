import { useState } from "react";
import Image from 'next/image';
import { Item } from "@/interfaces";
import Badge from '@/components/ui';


export default function ItemCard({ item } : { item: Item })
{

  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [itemPrice, setItemPrice] = useState<string>("0.001");


  const actions = (
    <>
    </>
  );

  const itemStatus = "RESELL"

  return (
    <>
      {
        item &&
        <div className="relative max-w-sm bg-white shadow-md rounded-3xl p-2 mx-1 my-3 cursor-pointer text-left">
          <div className="overflow-x-hidden rounded-2xl relative">
            <Image className="h-80 rounded-2xl w-full object-cover" src={item.image_url.startsWith("http") ? item.image_url : "/products/" + item.image_url} width="800" height="800" alt={item.name}/>
            <Badge color='secondary' className="absolute right-2 top-2">{itemStatus.toUpperCase()}</Badge>
          </div>
          <div className="mt-4 pl-2 mb-2 flex justify-between ">
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-0  min-h-[60px]">{item.name}</p>
              <p className="text-md text-gray-800 mt-0"> $ {item.price}</p>
            </div>
          </div>
          <div className="">
            {actions}
          </div>
        </div>
      }
    </>
  );
}
