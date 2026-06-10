import { create } from 'zustand';

// Định nghĩa khuôn dữ liệu cho Giỏ hàng
interface CartState {
  totalItems: number;
  addToCart: () => void;
}

// Tạo ra cái kho chứa (Store)
export const useCartStore = create<CartState>((set) => ({
  totalItems: 0, // Mặc định ban đầu giỏ hàng có 0 món
  
  // Hàm này mỗi lần gọi sẽ cộng số lượng lên 1
  addToCart: () => set((state) => ({ totalItems: state.totalItems + 1 })),
}));