import { ReactNode } from 'react';
import { Header } from './Header';
import Footer from './Footer';

type Props = {
    children: ReactNode;
};

export default function MarketplaceLayout({ children }: Props) {
  return (
    <>
      <Header/>
      <main className='bg-container'>{children}</main>
      <Footer/>
    </>
  );
}
      