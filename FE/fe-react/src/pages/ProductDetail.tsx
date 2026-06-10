import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Minus, Plus, ArrowLeft, ShieldCheck, Truck, Zap, Loader2 } from 'lucide-react';

const API_BASE_URL = 'https://localhost:7188/api';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export default function ProductDetail() {
  const { id } = useParams(); // Lấy ID từ thanh địa chỉ (URL)
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Product/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        alert("Sản phẩm không tồn tại hoặc đã bị xóa!");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sếp cần đăng nhập để thêm vào giỏ!");
      navigate('/login');
      return;
    }

    try {
      setIsAdding(true);
      await axios.post(`${API_BASE_URL}/Cart/add`, { 
        productId: product?.id, 
        quantity: quantity 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`🛒 Đã thêm ${quantity} sản phẩm vào giỏ!`);
      window.dispatchEvent(new Event('cartUpdated')); // Bắn tín hiệu cập nhật số lượng trên Navbar
    } catch (error) {
        console.error(error);
      alert("Thêm vào giỏ thất bại! Vui lòng thử lại.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={60} /></div>;
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Nút Quay lại */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 font-bold mb-8 transition">
          <ArrowLeft size={20} className="mr-2" /> Quay lại cửa hàng
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* CỘT TRÁI: Khu vực Ảnh */}
          <div className="md:w-1/2 p-8 md:p-12 bg-gray-50 flex items-center justify-center">
            <img 
                src={product?.imageUrl || 'https://placehold.co/600x600/f8f9fa/a0aec0?text=VU68'} 
                alt={product?.name} 
                className="w-full h-auto object-contain mix-blend-darken"
                onError={(e) => {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = 'https://placehold.co/600x600/f8f9fa/a0aec0?text=VU68+Product'; 
              }} 
            />
          </div>

          {/* CỘT PHẢI: Thông tin và Chốt đơn */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black tracking-wider mb-4 w-max uppercase">Hàng Chính Hãng</span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
            
            <div className="text-4xl font-black text-red-600 mb-6">
              {product.price.toLocaleString('vi-VN')}đ
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
              {product.description || "Chưa có bài viết đánh giá chi tiết cho sản phẩm này. Tuy nhiên đây là một siêu phẩm sếp không nên bỏ lỡ!"}
            </p>

            {/* Khung chọn số lượng & Add to cart */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              {/* Nút Tăng giảm số lượng */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 bg-white rounded-lg shadow-sm hover:text-red-600 hover:bg-red-50 transition"><Minus size={20} /></button>
                <span className="w-16 text-center font-black text-xl">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-3 bg-white rounded-lg shadow-sm hover:text-blue-600 hover:bg-blue-50 transition"><Plus size={20} /></button>
              </div>

              {/* Nút Thêm vào giỏ */}
              <button 
                onClick={handleAddToCart} 
                disabled={isAdding}
                className={`flex-1 w-full py-4 rounded-xl font-black text-white shadow-lg transition-all flex justify-center items-center space-x-2 ${isAdding ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}
              >
                <ShoppingCart size={24} />
                <span>{isAdding ? 'Đang thêm...' : `THÊM VÀO GIỎ • ${(product.price * quantity).toLocaleString('vi-VN')}đ`}</span>
              </button>
            </div>

            {/* Các icon cam kết */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-8">
              <div className="flex items-center space-x-3 text-sm font-medium text-gray-600"><Truck className="text-blue-500" size={24} /> <span>Giao hàng hỏa tốc 2h</span></div>
              <div className="flex items-center space-x-3 text-sm font-medium text-gray-600"><ShieldCheck className="text-green-500" size={24} /> <span>Bảo hành 24 tháng</span></div>
              <div className="flex items-center space-x-3 text-sm font-medium text-gray-600"><Zap className="text-orange-500" size={24} /> <span>Đổi trả 7 ngày</span></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}