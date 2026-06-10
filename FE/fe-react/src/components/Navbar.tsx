import { ShoppingCart, User, Search, Zap, Package, LogOut } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://ecommerce-dotnet-react-1.onrender.com/api';

interface CartItemInfo {
  quantity: number;
}

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [keyword, setKeyword] = useState('');

  // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 2. HÀM ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.assign('/'); 
  };

  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setCartCount(0);
        return;
    }
    
    try {
      const res = await axios.get(`${API_BASE_URL}/Cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = Array.isArray(res.data) ? res.data : [];
      const count = items.reduce((sum: number, item: CartItemInfo) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error("Navbar không tải được giỏ hàng:", error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCartCount(); 
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [fetchCartCount]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 md:px-12 lg:px-20 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.assign('/')}>
          <div className="bg-blue-600 text-white p-2 rounded-lg"><Zap size={24} fill="currentColor" /></div>
          <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 tracking-tight">TECHGEAR</span>
        </div>

        {/* THANH TÌM KIẾM */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-12 relative">
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && keyword.trim()) {
                window.location.assign('/?search=' + keyword.trim());
              }
            }}
            placeholder="Bạn muốn tìm laptop, chuột, bàn phím...?" 
            className="w-full pl-6 pr-14 py-3 bg-gray-100 border-none rounded-full outline-none text-gray-700 shadow-inner" 
          />
          <button 
            onClick={() => keyword.trim() && window.location.assign('/?search=' + keyword.trim())}
            className="absolute right-2 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-full transition"
          >
            <Search size={18} />
          </button>
        </div>

        {/* KHU VỰC NÚT BẤM CÁ NHÂN */}
        <div className="flex items-center space-x-6">
          
          {/* NÚT TÀI KHOẢN (Đã xử lý thông minh) */}
          {isLoggedIn ? (
            <div className="relative group cursor-pointer z-50">
              {/* Trạng thái đã đăng nhập: Hiển thị Avatar */}
              <div className="flex flex-col items-center text-blue-600 transition">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                  V
                </div>
                <span className="text-xs font-semibold mt-1">Tài khoản</span>
              </div>
              
              {/* Menu Dropdown khi trỏ chuột vào */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                <div className="py-2">
                  <a href="/profile" className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">Hồ sơ cá nhân</a>
                  <a href="/my-orders" className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">Đơn hàng của tôi</a>
                  
                  {/* Nếu là Admin thì hiện thêm nút vào trang Quản trị */}
                  {role === 'Admin' && (
                    <a href="/admin" className="block px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition">Vào Bảng Điều Khiển</a>
                  )}
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  {/* Nút Đăng xuất */}
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition flex items-center">
                    <LogOut size={16} className="mr-2" /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Trạng thái chưa đăng nhập: Nút Đăng nhập/Đăng ký */
            <button onClick={() => window.location.assign('/login')} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition group cursor-pointer bg-transparent border-none">
              <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition"><User size={22} /></div>
              <span className="text-xs font-semibold mt-1">Đăng nhập</span>
            </button>
          )}
          
          {/* Nút 2: Lịch sử đơn hàng */}
          <button onClick={() => window.location.assign('/my-orders')} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition group cursor-pointer bg-transparent border-none">
            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition"><Package size={22} /></div>
            <span className="text-xs font-semibold mt-1">Đơn hàng</span>
          </button>

          {/* Nút 3: Giỏ hàng */}
          <div onClick={() => window.location.assign('/cart')} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition group cursor-pointer relative">
            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition"><ShoppingCart size={22} /></div>
            <span className="text-xs font-semibold mt-1">Giỏ hàng</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}