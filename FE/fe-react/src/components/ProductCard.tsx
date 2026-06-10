import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

// Định nghĩa khuôn dữ liệu chuẩn
interface ProductProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  // Kéo hàm addToCart từ Store ra đây
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100">
      {/* Khu vực ảnh sản phẩm */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <img 
          src={product.imageUrl || 'https://placehold.co/600x400/png?text=Chua+co+anh'} 
          alt={product.name} 
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/png?text=Chua+co+anh'; }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          -15%
        </div>
      </div>

      {/* Khu vực thông tin */}
      <div className="p-5">
        <h3 className="font-bold text-gray-800 text-lg truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-5 flex items-center justify-between">
          <span className="font-extrabold text-xl text-blue-600">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          
          {/* Nút thêm vào giỏ hàng đã gắn sự kiện */}
          <button 
            onClick={addToCart}
            className="bg-blue-50 text-blue-600 p-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-colors active:scale-95"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}