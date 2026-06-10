/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface IProduct { id: string; name: string; price: number; imageUrl: string; }

interface WishlistContextType {
  wishlist: IProduct[];
  toggleWishlist: (product: IProduct) => void;
  isInWishlist: (id: string) => boolean;
}

export const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<IProduct[]>(() => {
    const saved = localStorage.getItem('vu68_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vu68_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product: IProduct) => {
    setWishlist(prev => {
      const isExist = prev.find(p => p.id === product.id);
      if (isExist) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook rút gọn
export const useWishlist = () => useContext(WishlistContext);