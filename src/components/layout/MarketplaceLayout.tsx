import { ReactNode } from 'react';
import Footer from './Footer';

type Props = {
    children: ReactNode;
};

export default function MarketplaceLayout({ children }: Props) {
  return (
    <>
      <main className='bg-container'>{children}</main>
      <Footer/>
    </>
  );
}
      