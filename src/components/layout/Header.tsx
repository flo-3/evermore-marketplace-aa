import { useRouter } from "next/router";
import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

import Logo from "/public/logo.png";



function Header() {

  const router = useRouter();
  const [isNavExpanded, setIsNavExpanded] = useState(false)

  return (
    <>
      <header id="header" className="bg-gray-50">
        <div className="flex justify-between items-start py-6 px-2 md:px-4 lg:px-10 w-full">
          <Link href="/">
            <Image src={Logo} alt="Evermore logo" className="w-20" priority/>
          </Link>

          <div>
           
          </div>

        </div>

        <div
          id="mobile-menu"
          className={
            isNavExpanded ? "lg:hidden navigation-menu open" : "lg:hidden navigation-menu"
          }
        >
        </div>
      </header>
      
    </>
  )
}


export { Header }
