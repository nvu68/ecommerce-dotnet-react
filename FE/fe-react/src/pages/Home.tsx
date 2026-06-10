import React, { useState, useEffect } from 'react';
import axios, { type AxiosRequestConfig } from 'axios';

import { 
  Search, ShoppingCart, User, Phone, Truck, 
  MapPin, X, FileText, Zap, ShieldCheck,
  Laptop, Gamepad2, Briefcase, Code, Sparkles, Command, HardDrive, Keyboard, Usb, Fan,
  ChevronRight, Bell, Heart, Star, GitCompare, CreditCard, Trash2
} from 'lucide-react';
import { useWishlist } from '../store/WishlistContext';

const API_BASE_URL = 'https://ecommerce-dotnet-react-1.onrender.com/api';

interface Product { id: string; name: string; price: number; description: string; imageUrl: string; categoryId?: string; oldPrice?: number; tags?: string[]; brand?: string; rating?: number; reviews?: number;}
interface Category { id: string; name: string; }
interface CartItem { productId: string; productName: string; price: number; quantity: number; }
interface MegaMenuSeries { id: string; name: string; }
interface MegaMenuBrand { brandId: string; brandName: string; series: MegaMenuSeries[]; }
interface MegaMenuItem { id: string; name: string; brands: MegaMenuBrand[]; }

// ================= CẤU HÌNH DANH MỤC 3 CẤP (FULL 10 DANH MỤC) =================

// ================= DỮ LIỆU SIÊU PHẨM MOCK ĐẦY ĐỦ =================


const BRANDS = ['Apple', 'ASUS', 'Dell', 'Lenovo', 'HP', 'MSI', 'Acer'];

export default function Home() {
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // AUTH LOGIC
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.reload(); 
  };

  const getAuthHeader = (): AxiosRequestConfig | undefined => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  };

  // CART & CHECKOUT LOGIC
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [formData, setFormData] = useState({ address: '', phone: '', note: '' });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY' | 'MOMO' | 'BANK'>('COD');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewAllCat, setViewAllCat] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // LOGIC YÊU THÍCH (MỚI THÊM)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const fetchCartManual = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/Cart`, authHeader);
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) { 
      console.error("Lỗi tải giỏ hàng:", error); 
    }
  };
    // 1. Đổi <any[]> thành <MegaMenuItem[]>
  const [megaMenuData, setMegaMenuData] = useState<MegaMenuItem[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // PHẢI CÓ ĐỦ 3 CÁI NÀY (Product, Category, Menu) THÌ CLIENT MỚI LÊN HÌNH ĐƯỢC SẾP NHÉ
        const [productRes, categoryRes, menuRes] = await Promise.all([
          // Ép lấy 5000 sản phẩm để Home tự chia kệ
          axios.get(`${API_BASE_URL}/Product?pageIndex=1&pageSize=5000`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/Category?pageIndex=1&pageSize=500`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/Category/MegaMenu`).catch(() => ({ data: [] }))
        ]);
        
        // Trích xuất mảng Sản phẩm
        let fetchedProducts = [];
        if (Array.isArray(productRes.data)) fetchedProducts = productRes.data;
        else if (productRes.data && productRes.data.items) fetchedProducts = productRes.data.items;

        // Trích xuất mảng Danh mục
        let fetchedCategories = [];
        if (Array.isArray(categoryRes.data)) fetchedCategories = categoryRes.data;
        else if (categoryRes.data && categoryRes.data.items) fetchedCategories = categoryRes.data.items;
        
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setMegaMenuData(Array.isArray(menuRes.data) ? menuRes.data : []);
        
        await fetchCartManual();
      } catch (error) { 
        console.error("Sếp bật F12 xem lỗi nhé:", error); 
      }
    };


    
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // HÀM XÓA SẢN PHẨM KHỎI GIỎ HÀNG
  const handleRemoveFromCart = async (productId: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader) return;

    try {
      // Gọi API xóa sản phẩm (Sử dụng method DELETE)
      await axios.delete(`${API_BASE_URL}/Cart/${productId}`, authHeader);
      
      // Load lại giỏ hàng ngay lập tức để cập nhật số lượng và tổng tiền
      await fetchCartManual(); 
      window.dispatchEvent(new Event('cartUpdated')); 
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Xóa thất bại! Sếp kiểm tra lại xem Backend đã có API Delete chưa nhé.");
    }
  };


  const handleAddToCart = async (productId: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      alert("Sếp cần đăng nhập để mua hàng nhé!");
      window.location.assign('/login'); 
      return;
    }
    

    try {
      await axios.post(`${API_BASE_URL}/Cart/add`, { productId, quantity: 1 }, authHeader);
      alert("🛒 Đã thêm siêu phẩm vào giỏ!");
      await fetchCartManual(); 
      window.dispatchEvent(new Event('cartUpdated')); 
    } catch  {
      alert("Thêm vào giỏ thất bại! Vui lòng thử lại.");
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Đã thêm vào danh sách So sánh (Tối đa 4 sản phẩm)!");
  };


  const submitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    if (paymentMethod !== 'COD') { 
      alert(`Chức năng thanh toán ${paymentMethod} đang chờ sếp ráp code Backend. Tạm thời chốt COD nhé!`); 
      return; 
    }

    const authHeader = getAuthHeader();
    try {
      setIsCheckingOut(true);
      const fullAddress = `${formData.address} (SĐT: ${formData.phone})`;
      await axios.post(`${API_BASE_URL}/Order/checkout`, { shippingAddress: fullAddress, note: formData.note }, authHeader);
      alert("🎉 Đặt hàng thành công! Đơn hàng đang được xử lý.");
      setCartItems([]); 
      setIsCartOpen(false); 
      setShowCheckoutForm(false); 
      setFormData({ address: '', phone: '', note: '' }); 
      window.dispatchEvent(new Event('cartUpdated')); 
    } catch  {
      alert("Thanh toán thất bại, sếp check lại Backend xem!");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const scrollToCategory = (categoryName: string) => {
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };


  const searchResults = searchTerm ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  return (
    <div className="bg-[#f4f7f9] min-h-screen font-sans text-gray-800 relative w-full overflow-x-hidden">
      
      {/* ================= 1. HEADER CHUẨN E-COMMERCE (FULL GIÁP) ================= */}
      <header className="w-full flex flex-col bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        
        {/* Topbar */}
        <div className="bg-gray-900 text-gray-300 text-xs py-2 px-4 xl:px-10 flex justify-between items-center hidden md:flex">
          <div className="flex space-x-6 font-medium tracking-wide">
            <span className="hover:text-white cursor-pointer transition flex items-center"><MapPin size={12} className="mr-1.5 text-[#ff6a00]"/> 68 Cửa hàng</span>
            <span className="hover:text-white cursor-pointer transition flex items-center"><Truck size={12} className="mr-1.5 text-[#ff6a00]"/> Tra cứu đơn hàng</span>
            <span className="hover:text-white cursor-pointer transition flex items-center"><Phone size={12} className="mr-1.5 text-[#ff6a00]"/> Hotline: 1900 6868</span>
          </div>
          <div className="flex items-center text-[#ff6a00] font-bold animate-pulse">
            🔥 Siêu Sale Công Nghệ Giảm Đến 50%
          </div>
        </div>

        {/* Main Navbar */}
        <div className="py-4 px-4 xl:px-10 flex flex-wrap items-center justify-between gap-6">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => window.location.assign('/')}>
            <div className="bg-gradient-to-br from-[#ff6a00] to-orange-400 p-2.5 rounded-xl mr-3 shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Zap size={28} className="text-white fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">VU68<span className="text-[#ff6a00]">.</span></h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Hi-end PC & Gaming</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-4xl mx-auto order-3 md:order-none w-full">
            <div className="flex w-full bg-gray-100 hover:bg-gray-200 focus-within:bg-white border-2 border-transparent focus-within:border-[#ff6a00] rounded-2xl overflow-hidden transition-all duration-300 shadow-inner">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm siêu phẩm MacBook, RTX 4090, Keychron..." className="flex-1 px-6 py-4 bg-transparent outline-none text-[15px] font-medium text-gray-700 placeholder-gray-400" />
              <button className="bg-gray-900 hover:bg-[#ff6a00] text-white px-10 transition-colors flex items-center justify-center"><Search size={22} /></button>
            </div>
          </div>

          {/* User Tools (Yêu thích, Thông báo, Giỏ hàng, Tài khoản) */}
          <div className="flex items-center space-x-6 xl:space-x-8">
            
            {/* Nút Yêu thích ĐÃ SỬA */}
            <div onClick={() => setIsWishlistOpen(true)} className="relative cursor-pointer hover:text-[#ff6a00] transition group hidden lg:block">
              <Heart size={26} className="text-gray-600 group-hover:text-[#ff6a00]" />
              {/* CHỈ HIỆN SỐ KHI CÓ TIM */}
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </div>

            {/* Nút Thông báo */}
            <div className="relative cursor-pointer hover:text-[#ff6a00] transition group hidden lg:block">
              <Bell size={26} className="text-gray-600 group-hover:text-[#ff6a00]" />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">3</span>
            </div>

            {/* Tài Khoản / Avatar */}
            {isLoggedIn ? (
              <div className="relative group cursor-pointer z-50">
                <div className="flex items-center space-x-3 hover:text-[#ff6a00] transition py-2">
                  <div className="w-12 h-12 bg-gray-100 border-2 border-transparent group-hover:border-[#ff6a00] rounded-full flex items-center justify-center overflow-hidden transition-all">
                    <img src="https://ui-avatars.com/api/?name=VU68&background=ff6a00&color=fff&bold=true" alt="Avatar User" className="w-full h-full object-cover" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs text-gray-500 font-bold mb-0.5">Xin chào,</p>
                    <p className="text-sm font-black text-gray-800 leading-none">Thành viên</p>
                  </div>
                </div>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-3 overflow-hidden">
                  <div className="p-2">
                    <a href="/profile" className="flex items-center px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-[#ff6a00] rounded-xl transition"><User size={16} className="mr-3"/> Hồ sơ cá nhân</a>
                    <a href="/my-orders" className="flex items-center px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-[#ff6a00] rounded-xl transition"><FileText size={16} className="mr-3"/> Đơn hàng của tôi</a>
                    {role === 'Admin' && <a href="/admin" className="flex items-center px-4 py-3 text-sm font-black text-blue-600 hover:bg-blue-50 rounded-xl transition"><ShieldCheck size={16} className="mr-3"/> Kênh Quản Trị</a>}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition"><X size={16} className="mr-3"/> Đăng xuất</button>
                  </div>
                </div>
              </div>
            ) : (
              <div onClick={() => window.location.assign('/login')} className="flex items-center space-x-3 hover:text-[#ff6a00] cursor-pointer transition group">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-orange-50 transition"><User size={20} className="text-gray-600 group-hover:text-[#ff6a00]" /></div>
                <span className="font-bold text-[15px] hidden lg:block text-gray-700">Đăng nhập</span>
              </div>
            )}
            
            {/* Giỏ Hàng */}
            <div onClick={() => { setIsCartOpen(true); setShowCheckoutForm(false); fetchCartManual(); }} className="relative cursor-pointer group flex items-center space-x-3 pl-2 border-l border-gray-200">
              <div className="w-12 h-12 bg-[#ff6a00] rounded-full flex items-center justify-center shadow-md shadow-orange-200 group-hover:-translate-y-1 transition-transform">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <span className="font-bold text-[15px] hidden lg:block text-gray-700 group-hover:text-[#ff6a00] transition">Giỏ hàng</span>
              <span className="absolute -top-1 left-9 bg-gray-900 text-white text-[11px] font-black h-6 w-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* ================= 2. MAIN CONTAINER ================= */}
      <div className="w-full mx-auto px-4 xl:px-10 py-6 flex flex-col gap-10">
        
        {/* KHU VỰC 1: MENU DANH MỤC + HERO SLIDER */}
<section
  className={`flex flex-col xl:flex-row gap-6 items-stretch ${
    viewAllCat || searchTerm ? 'hidden' : ''
  }`}
>          
          {/* ================= MEGA MENU 3 CẤP BÊN TRÁI ================= */}
          {/* ================= MEGA MENU 3 CẤP BÊN TRÁI ================= */}
          <aside className="w-full xl:w-[280px] bg-white rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 hidden md:block relative z-[60]">
            <div className="bg-[#ff6a00] text-white font-black px-6 py-4 flex items-center rounded-t-2xl">
              <Laptop size={20} className="mr-3" /> DANH MỤC SẢN PHẨM
            </div>
            
            <ul className="flex flex-col relative">
              {megaMenuData
                .slice() // Tạo bản sao để an toàn không lỗi state
                .sort((a, b) => {
                  // KHAI BÁO THỨ TỰ CHUẨN SẾP YÊU CẦU Ở ĐÂY
                  const targetOrder = [
                    'Máy tính xách tay',
                    'Laptop cao cấp',
                    'Laptop Gaming - Đồ Họa',
                    'Laptop Lập trình',
                    'Laptop Văn phòng',
                    'Apple Macbook',
                    'Kho phụ kiện',
                    'RAM - SSD',
                    'Tản nhiệt laptop',
                    'Cổng chuyển'
                  ];
                  
                  // Tìm vị trí của từng danh mục, nếu không có trong list thì đẩy xuống bét (99)
                  const indexA = targetOrder.indexOf(a.name) !== -1 ? targetOrder.indexOf(a.name) : 99;
                  const indexB = targetOrder.indexOf(b.name) !== -1 ? targetOrder.indexOf(b.name) : 99;
                  
                  return indexA - indexB;
                })
                .map((item) => {
                let CatIcon = Laptop;
                if (item.name.includes('Gaming')) CatIcon = Gamepad2;
                else if (item.name.includes('Văn phòng')) CatIcon = Briefcase;
                else if (item.name.includes('Lập trình')) CatIcon = Code;
                else if (item.name.includes('cao cấp')) CatIcon = Sparkles;
                else if (item.name.includes('Macbook')) CatIcon = Command;
                else if (item.name.includes('RAM')) CatIcon = HardDrive;
                else if (item.name.includes('phụ kiện')) CatIcon = Keyboard;
                else if (item.name.includes('Cổng')) CatIcon = Usb;
                else if (item.name.includes('Tản nhiệt')) CatIcon = Fan;

                // CHỈ BẬT MEGA MENU CHO CÁC DANH MỤC NÀY
                const isLaptopCategory = ['Máy tính xách tay', 'Laptop Gaming - Đồ Họa', 'Laptop cao cấp', 'Laptop Lập trình', 'Laptop Văn phòng'].includes(item.name);

                return (
                <li key={item.id} onClick={() => scrollToCategory(item.name)} className="flex items-center px-6 py-3.5 cursor-pointer transition-colors font-bold text-[15px] text-gray-700 hover:text-[#ff6a00] hover:bg-orange-50/50 group border-b border-gray-50 last:border-0">
                  <CatIcon className="w-5 h-5 mr-4 text-gray-400 group-hover:text-[#ff6a00] transition-colors" strokeWidth={2} />
                  {item.name}
                  {/* Chỉ hiện mũi tên > nếu có menu con */}
                  <ChevronRight size={16} className={`ml-auto transition-opacity text-[#ff6a00] ${isLaptopCategory ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}/>
                  
                  {/* === BẢNG CẤP 2 (CHỈ HIỆN KHI LÀ LAPTOP) === */}
                  {isLaptopCategory && item.brands && item.brands.length > 0 && (
                    <div className="absolute left-full top-0 ml-0 w-[220px] h-full bg-white border border-gray-100 shadow-[10px_5px_30px_rgba(0,0,0,0.08)] rounded-r-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] py-2">
                      <ul className="relative h-full">
                        {item.brands.map((brand: { brandId: string; brandName: string; series: { id: string; name: string }[] }, idx: number) => (
                          <li key={idx} className="group/brand px-6 py-3 hover:bg-orange-50 hover:text-[#ff6a00] font-bold text-[14px] text-gray-700 flex justify-between items-center transition-colors">
                            {brand.brandName}
                            <ChevronRight size={14} className="opacity-0 group-hover/brand:opacity-100 transition-opacity text-[#ff6a00]"/>

                            {/* === BẢNG CẤP 3 (CHỌN DÒNG MÁY) === */}
                            {brand.series && brand.series.length > 0 && (
                            <div className="absolute left-full top-0 ml-0 w-[450px] min-h-full bg-white border border-gray-100 shadow-[20px_10px_40px_rgba(0,0,0,0.1)] rounded-2xl opacity-0 invisible group-hover/brand:opacity-100 group-hover/brand:visible transition-all duration-200 p-6 z-[110]">
                              <h3 className="text-[#ff6a00] font-black text-lg mb-5 border-b border-gray-100 pb-3 uppercase tracking-wide">
                                CÁC DÒNG {brand.brandName}
                              </h3>
                              <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                                {brand.series.map((s: { id: string; name: string }, sIdx: number) => (
                                  <div key={sIdx} onClick={(e) => { e.stopPropagation(); alert(`Sếp đang muốn xem: ${s.name}`) }} className="text-[14px] font-semibold text-gray-700 hover:text-[#ff6a00] hover:translate-x-2 transition-transform cursor-pointer flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3"></div> {s.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                            )}
                            {/* === HẾT BẢNG CẤP 3 === */}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* === HẾT BẢNG CẤP 2 === */}
                </li>
              )})}
            </ul>
          </aside>
          {/* Cột Banner Phải */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 h-auto">
            
            {/* Hero Slider To */}
            <div className="flex-[2.5] rounded-2xl overflow-hidden relative shadow-sm cursor-pointer group bg-gray-900 h-full min-h-[300px] xl:min-h-0">
              <img src="https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=1200&auto=format&fit=crop" alt="Main Banner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 xl:p-10">
                <span className="border border-orange-500/50 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full w-max mb-3 uppercase bg-orange-500/10 backdrop-blur-md">Độc quyền</span>
                <h2 className="text-white text-4xl xl:text-5xl font-black mb-3 leading-tight">THE NEW <br/>STANDARD 2024</h2>
                <p className="text-gray-300 text-base mb-8 max-w-md hidden sm:block">Trải nghiệm màn hình cong chuẩn Esport với tần số quét 240Hz siêu mượt.</p>
                <div className="flex items-center gap-6 mt-auto sm:mt-0">
                  <span className="text-[#ff6a00] text-3xl xl:text-4xl font-black border-r border-gray-600 pr-6">4.990.000đ</span>
                  <button className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full text-[15px] hover:bg-[#ff6a00] hover:text-white transition shadow-lg hover:shadow-orange-500/30">MUA NGAY</button>
                </div>
              </div>
              
              {/* Slider Dots */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                <div className="w-8 h-2 bg-[#ff6a00] rounded-full cursor-pointer"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full hover:bg-white cursor-pointer transition-colors"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full hover:bg-white cursor-pointer transition-colors"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full hover:bg-white cursor-pointer transition-colors"></div>
              </div>
            </div>
            
            {/* 2 Banner Nhỏ */}
            <div className="flex-[1] flex flex-col gap-6 hidden md:flex h-full">
              <div className="flex-1 rounded-2xl overflow-hidden relative shadow-sm cursor-pointer group bg-blue-900">
                <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop" alt="Small Banner 1" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-5 left-5 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg z-10">SALE 17%</div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent flex flex-col justify-end p-5 xl:p-6">
                  <p className="text-white font-black text-xl xl:text-2xl leading-tight">CATCH BIG DEALS</p>
                  <p className="text-gray-300 text-xs xl:text-sm mt-2 flex items-center group-hover:text-white transition"><ChevronRight size={16} className="mr-1"/> Khám phá Tai nghe</p>
                </div>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden relative shadow-sm cursor-pointer group bg-purple-900">
                <img src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop" alt="Small Banner 2" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-5 left-5 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg z-10">SALE 10%</div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent flex flex-col justify-end p-5 xl:p-6">
                  <p className="text-white font-black text-xl xl:text-2xl leading-tight">HOT GEARS</p>
                  <p className="text-gray-300 text-xs xl:text-sm mt-2 flex items-center group-hover:text-white transition"><ChevronRight size={16} className="mr-1"/> Khám phá Phụ kiện</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* KHU VỰC 2: THƯƠNG HIỆU NỔI BẬT */}
<section
  className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden ${
    viewAllCat || searchTerm ? 'hidden' : ''
  }`}
>          <h2 className="text-xl font-black text-gray-900 mb-6 uppercase text-center tracking-widest">Thương Hiệu Đồng Hành</h2>
          <div className="flex flex-wrap justify-center gap-4 xl:gap-8">
            {BRANDS.map(brand => (
              <div key={brand} className="w-24 h-12 xl:w-36 xl:h-16 flex items-center justify-center border border-gray-200 rounded-xl hover:border-[#ff6a00] hover:shadow-md transition-all cursor-pointer bg-gray-50 grayscale hover:grayscale-0">
                <span className="font-black text-gray-800 text-lg xl:text-2xl tracking-wider">{brand}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= KHU VỰC TÌM KIẾM HOẶC HIỂN THỊ SP ================= */}
        {searchTerm ? (
          /* ================= GIAO DIỆN 3: KẾT QUẢ TÌM KIẾM (FULL MÀN HÌNH + PHÂN TRANG) ================= */
          <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] bg-[#f4f7f9] min-h-screen pb-20 animate-in fade-in duration-300 z-40">
             <div className="max-w-[1400px] mx-auto px-4 xl:px-10 pt-10">
                 
                 {/* Header Kết quả tìm kiếm & Nút Quay lại */}
                 <div className="flex items-center space-x-4 mb-8 border-b border-gray-200 pb-5 sticky top-[70px] pt-4 bg-[#f4f7f9]/95 backdrop-blur-md z-50">
                    <button 
                        onClick={() => { setSearchTerm(''); setCurrentPage(1); }} 
                        className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 bg-white flex-shrink-0"
                    >
                       <ChevronRight size={24} className="rotate-180 text-gray-500"/>
                    </button>
                    <h2 className="text-2xl xl:text-4xl font-medium text-gray-800">
                       Có <strong className="text-red-600 font-black">{searchResults.length}</strong> sản phẩm với từ khóa: <strong className="text-red-600 font-black">{searchTerm}</strong>
                    </h2>
                 </div>

                 {/* Xử lý thuật toán Đổ Lưới và Phân trang cho Tìm Kiếm */}
                 {(() => {
                    const itemsPerPage = 25; // 5 máy x 5 hàng = 25 máy/trang
                    const totalPages = Math.ceil(searchResults.length / itemsPerPage);
                    
                    // Thuật toán bảo vệ: Tránh lỗi trang khi đang ở trang 3 mà gõ tìm từ khóa khác
                    const safeCurrentPage = (currentPage > totalPages && totalPages > 0) ? 1 : currentPage;
                    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
                    const currentProds = searchResults.slice(startIndex, startIndex + itemsPerPage);

                    return (
                       <div className="bg-white p-6 xl:p-8 rounded-2xl shadow-sm border border-gray-100">
                          {currentProds.length > 0 ? (
                              <>
                                 {/* Ép chuẩn 5 cột */}
                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6">
                                    {currentProds.map((p, idx) => (
                                       <ProductCard key={p.id} p={p} idx={idx} onAddCart={handleAddToCart} onCompare={handleCompare} />
                                    ))}
                                 </div>
                                 
                                 {/* KHU VỰC NÚT BẤM PHÂN TRANG TÌM KIẾM */}
                                 {totalPages > 1 && (
                                     <div className="flex justify-center items-center mt-12 space-x-2 border-t border-gray-100 pt-8">
                                         <button 
                                             disabled={safeCurrentPage === 1}
                                             onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                             className={`px-4 py-2 rounded-lg font-bold transition-colors ${safeCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-[#ff6a00] hover:text-white border border-gray-200 hover:border-transparent shadow-sm'}`}
                                         >
                                             Trang trước
                                         </button>
                                         
                                         <div className="flex space-x-1 overflow-x-auto max-w-[200px] md:max-w-none">
                                             {[...Array(totalPages)].map((_, i) => (
                                                 <button 
                                                     key={i}
                                                     onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                     className={`flex-shrink-0 w-10 h-10 rounded-lg font-bold transition-colors shadow-sm ${safeCurrentPage === i + 1 ? 'bg-[#ff6a00] text-white' : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'}`}
                                                 >
                                                     {i + 1}
                                                 </button>
                                             ))}
                                         </div>

                                         <button 
                                             disabled={safeCurrentPage === totalPages}
                                             onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                             className={`px-4 py-2 rounded-lg font-bold transition-colors ${safeCurrentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-[#ff6a00] hover:text-white border border-gray-200 hover:border-transparent shadow-sm'}`}
                                         >
                                             Trang sau
                                         </button>
                                     </div>
                                 )}
                              </>
                          ) : (
                              <div className="text-center py-20 flex flex-col items-center">
                                  <span className="text-6xl mb-6">🔍</span>
                                  <div className="text-gray-900 font-black text-2xl mb-2">Không tìm thấy siêu phẩm nào!</div>
                                  <p className="text-sm font-semibold text-gray-400">Sếp thử kiểm tra lại lỗi chính tả hoặc dùng từ khóa chung chung hơn xem sao nhé.</p>
                              </div>
                          )}
                       </div>
                    );
                 })()}
             </div>
          </div>
        ) : viewAllCat ? (
          /* ================= GIAO DIỆN 2: XEM TẤT CẢ (LƯỚI SẢN PHẨM PHẲNG + PHÂN TRANG) ================= */
          <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] bg-[#f4f7f9] pb-20 animate-in fade-in duration-300 z-40">
             <div className="max-w-[1400px] mx-auto px-4 xl:px-10 pt-10">
                 
                 {/* Header chứa nút Quay lại (Bỏ toàn bộ các link Xem tất cả, Hãng...) */}
<div className="flex items-center space-x-4 mb-8 border-b border-gray-200 pb-5 sticky top-[70px] pt-4 bg-[#f4f7f9]/95 backdrop-blur-md z-50">
                    <button onClick={() => { setViewAllCat(null); setCurrentPage(1); }} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 bg-white">
                       <ChevronRight size={24} className="rotate-180 text-gray-500"/>
                    </button>
                    <h2 className="text-3xl xl:text-4xl font-black text-gray-900 uppercase tracking-wide">{viewAllCat}</h2>
                 </div>

                 {/* Xử lý thuật toán Đổ Lưới và Phân trang */}
                 {(() => {
                    const allCatProds = products.filter(p => categories.find(c => c.id === p.categoryId)?.name === viewAllCat);
                    const itemsPerPage = 25; // 5 sản phẩm x 5 hàng = 25 máy 1 trang
                    const totalPages = Math.ceil(allCatProds.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const currentProds = allCatProds.slice(startIndex, startIndex + itemsPerPage);

                    return (
                       <div className="bg-white p-6 xl:p-8 rounded-2xl shadow-sm border border-gray-100">
                          {currentProds.length > 0 ? (
                              <>
                                 {/* Ép chuẩn 5 cột (lg:grid-cols-5) */}
                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6">
                                    {currentProds.map((p, idx) => (
                                       <ProductCard key={p.id} p={p} idx={idx} onAddCart={handleAddToCart} onCompare={handleCompare} />
                                    ))}
                                 </div>
                                 
                                 {/* KHU VỰC NÚT BẤM PHÂN TRANG */}
                                 {totalPages > 1 && (
                                     <div className="flex justify-center items-center mt-12 space-x-2 border-t border-gray-100 pt-8">
                                         <button 
                                             disabled={currentPage === 1}
                                             onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                             className={`px-4 py-2 rounded-lg font-bold transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-[#ff6a00] hover:text-white border border-gray-200 hover:border-transparent shadow-sm'}`}
                                         >
                                             Trang trước
                                         </button>
                                         
                                         <div className="flex space-x-1 overflow-x-auto max-w-[200px] md:max-w-none">
                                             {[...Array(totalPages)].map((_, i) => (
                                                 <button 
                                                     key={i}
                                                     onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                     className={`flex-shrink-0 w-10 h-10 rounded-lg font-bold transition-colors shadow-sm ${currentPage === i + 1 ? 'bg-[#ff6a00] text-white' : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'}`}
                                                 >
                                                     {i + 1}
                                                 </button>
                                             ))}
                                         </div>

                                         <button 
                                             disabled={currentPage === totalPages}
                                             onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                             className={`px-4 py-2 rounded-lg font-bold transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-[#ff6a00] hover:text-white border border-gray-200 hover:border-transparent shadow-sm'}`}
                                         >
                                             Trang sau
                                         </button>
                                     </div>
                                 )}
                              </>
                          ) : (
                              <div className="text-center py-20 flex flex-col items-center">
                                  <span className="text-6xl mb-4">📭</span>
                                  <div className="text-gray-400 font-bold text-xl">Chưa có sản phẩm nào trong danh mục này!</div>
                              </div>
                          )}
                       </div>
                    );
                 })()}
             </div>
          </div>
        ) : (
          /* ================= GIAO DIỆN 1: BÊN NGOÀI (BLOCK 5 SẢN PHẨM KHÁC HÃNG NHAU) ================= */
          <div className="flex flex-col gap-10">
            {[
              'Máy tính xách tay', 'Laptop cao cấp', 'Laptop Gaming - Đồ Họa', 
              'Laptop Lập trình', 'Laptop Văn phòng', 'Apple Macbook',
              'Kho phụ kiện', 'RAM - SSD', 'Tản nhiệt laptop', 'Cổng chuyển'
            ].map((catName, index) => {
               const catProducts = products.filter(p => categories.find(c => c.id === p.categoryId)?.name === catName);

               const displayProducts: Product[] = [];
               const seenBrands = new Set<string>();

               for (const p of catProducts) {
                  let brand = p.name.split(' ')[0];
                  if (brand.toLowerCase() === 'macbook') brand = 'Apple';
                  if (brand.toLowerCase() === 'surface') brand = 'Microsoft Surface';
                  if (brand.toLowerCase() === 'alienware') brand = 'Dell';

                  if (!seenBrands.has(brand)) {
                     seenBrands.add(brand);
                     displayProducts.push(p);
                  }
                  if (displayProducts.length === 5) break;
               }
               
               if (displayProducts.length < 5) {
                  for (const p of catProducts) {
                     if (!displayProducts.find(dp => dp.id === p.id)) {
                        displayProducts.push(p);
                     }
                     if (displayProducts.length === 5) break;
                  }
               }

               const bannerColors = ['from-blue-600 to-blue-900', 'from-red-600 to-red-900', 'from-emerald-600 to-emerald-900', 'from-purple-600 to-purple-900', 'from-teal-600 to-teal-900'];
               const bgColor = bannerColors[index % bannerColors.length];

               return (
                  <section id={`category-${catName}`} key={catName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group/block">
                     <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff6a00]"></div>
                        <h2 className="text-xl font-black uppercase text-gray-800 tracking-wider flex items-center pl-2">
                           {catName}
                        </h2>
                        {/* CẬP NHẬT: Reset trang về 1 khi bấm Xem Tất Cả */}
                        <button onClick={() => { setViewAllCat(catName); setCurrentPage(1); }} className="text-sm font-bold text-blue-600 hover:text-[#ff6a00] hover:underline transition-colors flex items-center">
                           Xem tất cả <ChevronRight size={16} className="ml-1"/>
                        </button>
                     </div>
                     
                     <div className="flex flex-col xl:flex-row p-4 gap-4 bg-gray-50/30">
                        {/* CẬP NHẬT: Reset trang về 1 khi bấm vào Banner */}
                        <div onClick={() => { setViewAllCat(catName); setCurrentPage(1); }} className={`w-full xl:w-[260px] rounded-xl relative overflow-hidden flex-shrink-0 cursor-pointer hidden xl:flex items-center justify-center bg-gradient-to-br ${bgColor} shadow-inner`}>
                           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                           <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center transform transition-transform duration-500 group-hover/block:scale-105">
                              <span className="bg-yellow-400 text-gray-900 text-[12px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-widest shadow-md">Chỉ từ</span>
                              <span className="text-white text-5xl font-black mb-2 drop-shadow-lg">690K</span>
                              <span className="text-white/80 text-sm font-bold border border-white/30 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">Giảm thêm 10%</span>
                              <div className="bg-white text-gray-900 font-black text-sm px-6 py-3 rounded-xl shadow-xl hover:bg-[#ff6a00] hover:text-white transition-all duration-300">
                                 MUA NGAY
                              </div>
                           </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                           {displayProducts.length > 0 ? (
                               displayProducts.map((p, idx) => (
                                  <ProductCard key={p.id} p={p} idx={idx} onAddCart={handleAddToCart} onCompare={handleCompare} />
                               ))
                           ) : (
                               <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                   <span className="font-black text-xl mb-1 text-gray-300">KỆ ĐANG TRỐNG</span>
                                   <span className="text-sm font-semibold">Sếp hãy vào Admin thêm sản phẩm cho danh mục này nhé!</span>
                               </div>
                           )}
                        </div>
                     </div>
                  </section>
               );
            })}
          </div>
        )}
      </div>

      {/* ================= 3. OFFCANVAS CART & CHECKOUT TÍCH HỢP MOMO/VNPAY ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="flex-1 cursor-pointer" onClick={() => setIsCartOpen(false)}></div>
          <div className="w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-black text-gray-900">{showCheckoutForm ? 'Thanh Toán' : 'Giỏ Hàng'}</h2>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
            </div>

            {showCheckoutForm ? (
              <form onSubmit={submitCheckout} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold text-gray-800 text-[15px] border-b pb-3">Thông tin nhận hàng</h3>
                  <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Số điện thoại</label><input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-[#ff6a00] outline-none transition-colors font-semibold text-gray-800" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Địa chỉ giao</label><textarea required rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-[#ff6a00] outline-none transition-colors font-semibold text-gray-800" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Ghi chú</label><textarea rows={1} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:border-[#ff6a00] outline-none transition-colors font-semibold text-gray-800" /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 text-[15px] border-b pb-3 mb-4">Phương thức thanh toán</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'COD', name: 'Thanh toán khi nhận hàng', icon: Truck, color: 'text-orange-500' },
                      { id: 'VNPAY', name: 'Thanh toán VNPay', icon: CreditCard, color: 'text-blue-600' },
                      { id: 'MOMO', name: 'Ví điện tử MoMo', icon: Zap, color: 'text-pink-600' },
                      { id: 'BANK', name: 'Chuyển khoản Ngân hàng', icon: Briefcase, color: 'text-green-600' },
                    ].map(pm => (
                      <label key={pm.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === pm.id ? 'border-[#ff6a00] bg-orange-50 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}>
                        <input type="radio" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id as 'COD' | 'VNPAY' | 'MOMO' | 'BANK')} className="w-5 h-5 text-[#ff6a00] focus:ring-[#ff6a00]" />
                        <div className="ml-3 flex items-center">
                          <pm.icon size={22} className={`mr-3 ${pm.color}`}/>
                          <span className={`font-bold text-[15px] ${paymentMethod === pm.id ? 'text-gray-900' : 'text-gray-600'}`}>{pm.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-400 mt-32 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6"><ShoppingCart size={40} className="text-gray-400" /></div>
                    <p className="font-black text-xl text-gray-700 mb-2">Giỏ hàng rỗng</p>
                    <p className="text-[15px]">Hãy chọn thêm siêu phẩm nhé!</p>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={index} className="flex flex-col bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 text-[15px] pr-4 line-clamp-2 leading-snug">{item.productName}</h4>
                        <button 
                          onClick={() => handleRemoveFromCart(item.productId)} 
                          className="text-gray-300 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                           title="Xóa sản phẩm"
                                    >
                              <X size={16}/>
                        </button>
                    </div>
                      <div className="flex justify-between items-end mt-auto">
                        <div className="bg-gray-100 rounded-xl px-4 py-1.5 flex items-center">
                          <span className="text-xs font-bold text-gray-500 mr-2">SL:</span>
                          <span className="font-black text-gray-800">{item.quantity}</span>
                        </div>
                        <p className="font-black text-xl text-[#ff6a00]">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[15px]">Tổng cộng</span>
                  <span className="text-3xl font-black text-[#ff6a00]">{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {showCheckoutForm ? (
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => setShowCheckoutForm(false)} className="w-1/3 py-4 rounded-xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">QUAY LẠI</button>
                    <button onClick={submitCheckout} disabled={isCheckingOut} className={`w-2/3 py-4 rounded-xl font-black text-white shadow-xl transition-all ${isCheckingOut ? 'bg-gray-400' : 'bg-gray-900 hover:bg-[#ff6a00] hover:-translate-y-1 hover:shadow-orange-200'}`}>
                      {isCheckingOut ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowCheckoutForm(true)} className="w-full py-4.5 rounded-xl font-black text-lg text-white shadow-xl bg-[#ff6a00] hover:bg-orange-600 transition-all hover:-translate-y-1 hover:shadow-orange-300">
                    TIẾN HÀNH THANH TOÁN
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ================= 4. OFFCANVAS WISHLIST (DANH SÁCH YÊU THÍCH) ================= */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="flex-1 cursor-pointer" onClick={() => setIsWishlistOpen(false)}></div>
          <div className="w-full max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Heart className="fill-red-500 text-red-500" size={24} /> Yêu Thích ({wishlist.length})
              </h2>
              <button onClick={() => setIsWishlistOpen(false)} className="w-10 h-10 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center text-gray-400 mt-32 flex flex-col items-center">
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6"><Heart size={40} className="text-red-200" /></div>
                  <p className="font-black text-xl text-gray-700 mb-2">Chưa thả tim ai!</p>
                  <p className="text-[15px]">Hãy chọn siêu phẩm sếp ưng ý nhé.</p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md transition">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
                    <div className="flex-1">
                      <h4 onClick={() => window.location.assign(`/product/${item.id}`)} className="font-bold text-sm text-gray-800 line-clamp-2 hover:text-[#ff6a00] cursor-pointer">{item.name}</h4>
                      <p className="text-red-500 font-black text-[15px] mt-1">{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <button onClick={() => toggleWishlist(item)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition"><Trash2 size={18} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

// ================= THÀNH PHẦN PRODUCT CARD CÓ RATING & SO SÁNH =================
// ================= THÀNH PHẦN PRODUCT CARD CÓ RATING & SO SÁNH =================
function ProductCard({ p, idx, onAddCart, onCompare }: { p: Product, idx: number, onAddCart: (id: string) => void, onCompare: (e: React.MouseEvent) => void }) {
  const rating = p.rating || 4.5;
  const reviews = p.reviews || 89;
  
  // MỚI THÊM: Gọi hook yêu thích
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(p.id); // Kiểm tra xem máy này có trong tim không

  return (
    <div className="bg-white rounded-2xl p-4 xl:p-5 border border-gray-100 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-[#ff6a00]/30 transition-all duration-300 group flex flex-col relative h-full">
      
      {/* Badge Mới / Giảm giá */}
      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-md z-10 uppercase tracking-wider">Giảm {10 + (idx * 5)}%</div>
      
      {/* Nút hành động ẩn (Yêu thích, So sánh) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-x-4 group-hover:translate-x-0">
        {/* NÚT TIM ĐÃ CẬP NHẬT TỰ ĐỘNG ĐỎ KHI BẤM */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }} 
          className="bg-white p-2.5 rounded-full shadow-lg transition-colors" 
          title="Thêm vào Yêu thích"
        >
          <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}/>
        </button>
        <button onClick={onCompare} className="bg-white p-2.5 rounded-full shadow-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="So sánh sản phẩm"><GitCompare size={16}/></button>
      </div>

      <div className="relative h-44 xl:h-52 mb-4 flex items-center justify-center p-2 cursor-pointer" onClick={() => window.location.assign(`/product/${p.id}`)}>
        <img src={p.imageUrl || 'https://placehold.co/400x400/f8f9fa/a0aec0?text=VU68'} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-darken" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x400/f8f9fa/a0aec0?text=VU68+Product'; }} />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Đánh giá sao */}
        <div className="flex items-center space-x-1.5 mb-2.5">
          <div className="flex text-yellow-400">
             {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(rating) ? 'currentColor' : 'none'} className={i >= Math.floor(rating) ? 'text-gray-300' : ''}/>)}
          </div>
          <span className="text-[11px] text-gray-400 font-bold">({reviews} đánh giá)</span>
        </div>

        <h3 onClick={() => window.location.assign(`/product/${p.id}`)} className="font-bold text-gray-800 leading-snug mb-2 hover:text-[#ff6a00] cursor-pointer line-clamp-2 text-[15px]">{p.name}</h3>
        <div className="bg-orange-50 text-[#ff6a00] text-[11px] font-bold px-2 py-1 rounded w-max mb-3 border border-orange-100">Trả góp 0%</div>
        
        <div className="mt-auto">
          <div className="text-xl font-black text-red-600 mb-0.5">{p.price.toLocaleString('vi-VN')}đ</div>
          <div className="text-xs text-gray-400 font-bold line-through mb-4">{(p.oldPrice || p.price * 1.2).toLocaleString('vi-VN')}đ</div>
          
          <button onClick={() => onAddCart(p.id)} className="w-full bg-gray-50 hover:bg-[#ff6a00] text-gray-700 hover:text-white font-bold py-3 rounded-xl transition-all duration-300 flex justify-center items-center space-x-2 border border-gray-200 hover:border-transparent">
            <ShoppingCart size={18} /> <span className="text-sm">MUA NGAY</span>
          </button>
        </div>
      </div>
    </div>
  );
}

