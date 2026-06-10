import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Package, Folders, Tags, Layers, Archive, 
  ShoppingCart, Users, Star, ImageIcon, Ticket, BarChart3, 
  PieChart, Shield, History, Settings, Menu, ChevronDown, 
  Edit, Trash2, Eye, EyeOff, Plus, X, Search, Filter,
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';

const API_BASE_URL = 'https://ecommerce-dotnet-react-1.onrender.com/api'; 

// ================= INTERFACES (CHUẨN HÓA) =================
interface IProduct { id: string; name: string; price: number; oldPrice?: number; stockQuantity: number; imageUrl: string; isDeleted: boolean; description?: string; categoryId?: string; }
interface ICategory { id: string; name: string; }
interface IOrder { id: string; customerName?: string; phoneNumber?: string; totalAmount: number; orderDate: string; status: number | string; orderItems?: unknown[]; }
interface IUser { id: string; userName?: string; email?: string; phoneNumber?: string; roles?: string[]; isActive?: boolean; }
interface IApiError { response?: { status?: number; data?: unknown }; }

// ================= DỮ LIỆU MẪU CHART =================
const revenueData = [{ name: 'T2', total: 120000000 }, { name: 'T3', total: 150000000 }, { name: 'T4', total: 180000000 }, { name: 'T5', total: 140000000 }, { name: 'T6', total: 220000000 }, { name: 'T7', total: 310000000 }, { name: 'CN', total: 280000000 }];
const topProductsData = [{ name: 'ASUS ROG G16', sales: 120 }, { name: 'MacBook Pro 14', sales: 98 }, { name: 'Dell XPS 15', sales: 86 }, { name: 'Lenovo Legion 5', sales: 75 }];
const MENU_STRUCTURE = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog', label: 'Quản lý sản phẩm', icon: Package, subItems: [{ id: 'products', label: 'Sản phẩm', icon: Package }, { id: 'categories', label: 'Danh mục', icon: Folders }, { id: 'brands', label: 'Hãng', icon: Tags }, { id: 'series', label: 'Dòng sản phẩm', icon: Layers }, { id: 'inventory', label: 'Kho hàng', icon: Archive }] },
  { id: 'sales', label: 'Quản lý bán hàng', icon: ShoppingCart, subItems: [{ id: 'orders', label: 'Đơn hàng', icon: ShoppingCart }, { id: 'customers', label: 'Khách hàng', icon: Users }, { id: 'reviews', label: 'Đánh giá (Chưa có API)', icon: Star }] },
  { id: 'marketing', label: 'Marketing', icon: BarChart3, subItems: [{ id: 'banners', label: 'Banner', icon: ImageIcon }, { id: 'coupons', label: 'Mã giảm giá', icon: Ticket }] },
  { id: 'reports', label: 'Báo cáo', icon: PieChart, subItems: [{ id: 'revenue-report', label: 'Doanh thu', icon: BarChart3 }, { id: 'stats-report', label: 'Thống kê', icon: PieChart }] },
  { id: 'system', label: 'Hệ thống', icon: Settings, subItems: [{ id: 'admins', label: 'Tài khoản Admin', icon: Shield }, { id: 'roles', label: 'Phân quyền', icon: Users }, { id: 'logs', label: 'Nhật ký hệ thống', icon: History }] },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['catalog', 'sales']); 
  const [dashboardStats, setDashboardStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if(!token) return;
        const res = await axios.get(`${API_BASE_URL}/Dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardStats(res.data);
      } catch (error) {
        console.error('Lỗi lấy thống kê Dashboard:', error);
      }
    };
    if(activeTab === 'dashboard') {
        fetchStats();
    }
  }, [activeTab]);

  const [adminProducts, setAdminProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]); 
  const [orders, setOrders] = useState<IOrder[]>([]); 
  const [customers, setCustomers] = useState<IUser[]>([]); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const pageSize = 10; 

// BIẾN QUẢN LÝ MODAL CHI TIẾT ĐƠN HÀNG
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const openOrderDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };  const [newProduct, setNewProduct] = useState({ name: '', price: '', stockQuantity: '', imageUrl: '', description: '', categoryId: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState({ id: '', name: '', price: '', stockQuantity: '', imageUrl: '', description: '', categoryId: '' });

  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);

  
  const [editCategory, setEditCategory] = useState({ id: '', name: '' });

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'products' || activeTab === 'categories' || activeTab === 'dashboard') {
            const [prodRes, catRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/Product?pageIndex=1&pageSize=10000`).catch(() => ({ data: [] })),
                axios.get(`${API_BASE_URL}/Category?pageIndex=1&pageSize=1000`).catch(() => ({ data: [] }))
            ]);
            let allData = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.items || []);
            allData = [...allData].reverse(); 
            setTotalProducts(allData.length);
            
            const startIndex = (currentPage - 1) * pageSize;
            setAdminProducts(allData.slice(startIndex, startIndex + pageSize));
            
            const fetchedCats = Array.isArray(catRes.data) ? catRes.data : (catRes.data.items || []);
            setCategories([...fetchedCats].reverse()); 
            if (fetchedCats.length > 0 && !newProduct.categoryId) {
                setNewProduct(prev => ({ ...prev, categoryId: fetchedCats[0].id }));
            }
        }

        if (activeTab === 'orders') {
            const ordRes = await axios.get(`${API_BASE_URL}/Order/all`, getAuthHeaders()).catch(() => ({ data: [] }));
            const fetchedOrders = Array.isArray(ordRes.data) ? ordRes.data : (ordRes.data.items || []);
            setOrders([...fetchedOrders].reverse()); 
        }

        if (activeTab === 'customers') {
            const custRes = await axios.get(`${API_BASE_URL}/Auth/users`, getAuthHeaders())
              .catch(() => axios.get(`${API_BASE_URL}/User`, getAuthHeaders()).catch(() => ({ data: [] })));
            const fetchedUsers = Array.isArray(custRes.data) ? custRes.data : (custRes.data.items || []);
            setCustomers(fetchedUsers);
        }

      } catch (error) { console.error("Lỗi kéo dữ liệu:", error); } 
      finally { setIsLoading(false); }
    };

    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, refreshTrigger]);

  // === HÀM SẢN PHẨM ===

// ================= API DUYỆT ĐƠN HÀNG =================
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Gọi API sang C# để lưu trạng thái mới
      await axios.put(`${API_BASE_URL}/Order/${orderId}/status`, { status: newStatus }, getAuthHeaders());
      alert('Cập nhật trạng thái đơn hàng thành công!');
      setRefreshTrigger(p => p + 1); // F5 lại bảng tự động
    } catch (error) {
      const err = error as IApiError;
      console.log(err);
      alert(`Cập nhật thất bại (Mã lỗi: ${err.response?.status})! Sếp F12 sang tab Network xem nhé.`);
    }
  };

  const handleDeleteProduct = async (id: string) => { 
    if (window.confirm('Xóa sản phẩm này?')) { 
      try { 
        await axios.delete(`${API_BASE_URL}/Product/${id}`, getAuthHeaders()); 
        setRefreshTrigger(p => p + 1); 
      } catch (error) { 
        console.log(error); 
        alert('Lỗi xóa sản phẩm!'); 
      } 
    } 
  };
  
  const handleAddProduct = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      const payload = { ...newProduct, price: Number(newProduct.price), stockQuantity: Number(newProduct.stockQuantity), categoryId: newProduct.categoryId || categories[0]?.id }; 
      await axios.post(`${API_BASE_URL}/Product`, payload, getAuthHeaders()); 
      setIsAddModalOpen(false); 
      setCurrentPage(1); 
      setRefreshTrigger(p => p + 1); 
    } catch (error) { 
      console.log(error); 
      alert('Lỗi thêm sản phẩm!'); 
    } 
  };

  const handleUpdateProduct = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      // Gói đủ data để C# không chê
      const payload = { 
        id: editProduct.id,
        name: editProduct.name,
        price: Number(editProduct.price), 
        stockQuantity: Number(editProduct.stockQuantity),
        imageUrl: editProduct.imageUrl || '',
        description: editProduct.description || '',
        categoryId: editProduct.categoryId || categories[0]?.id
      }; 
      
      await axios.put(`${API_BASE_URL}/Product/${editProduct.id}`, payload, getAuthHeaders()); 
      
      setIsEditModalOpen(false); 
      setRefreshTrigger(p => p + 1); 
      alert('Sửa sản phẩm thành công!');
    } 
    catch (error) { 
      console.log("LỖI SỬA SP:", error); 
      alert('Lỗi sửa sản phẩm! Sếp mở F12 xem Console nó báo gì nhé.'); 
    } 
  };

  const openEditModal = (p: IProduct) => { 
    setEditProduct({ 
      id: p.id || '', 
      name: p.name || '', 
      price: p.price?.toString() || '0', 
      stockQuantity: p.stockQuantity?.toString() || '0', 
      imageUrl: p.imageUrl || '', 
      description: p.description || '', 
      categoryId: p.categoryId || (categories.length > 0 ? categories[0].id : '') 
    }); 
    setIsEditModalOpen(true); 
  };

  // === HÀM DANH MỤC ===
  const handleAddCategory = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      await axios.post(`${API_BASE_URL}/Category`, { name: newCategory.name }, getAuthHeaders()); 
      setIsAddCatModalOpen(false); 
      setRefreshTrigger(p=>p+1); 
    } catch(error){ 
      console.log(error); 
      alert('Lỗi thêm danh mục!'); 
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      await axios.put(`${API_BASE_URL}/Category/${editCategory.id}`, { id: editCategory.id, name: editCategory.name }, getAuthHeaders()); 
      setIsEditCatModalOpen(false); 
      setRefreshTrigger(p=>p+1); 
    } catch(error){ 
      console.log(error); 
      alert('Lỗi sửa danh mục!'); 
    }
  };

  const handleDeleteCategory = async (id: string) => { 
    if (window.confirm('Xóa danh mục?')) { 
      try { 
        await axios.delete(`${API_BASE_URL}/Category/${id}`, getAuthHeaders()); 
        setRefreshTrigger(p=>p+1); 
      } catch(error){ 
        console.log(error); 
        alert('Lỗi xóa danh mục!'); 
      } 
    }
  };

  const openEditCatModal = (c: ICategory) => { 
    setEditCategory({ id: c.id, name: c.name }); 
    setIsEditCatModalOpen(true); 
  };

  const toggleMenu = (menuId: string) => { setExpandedMenus(prev => prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]); };
  const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/login'; };
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 z-20 flex-shrink-0 shadow-2xl`}>
        <div className="h-16 flex items-center justify-between px-4 bg-gray-950 border-b border-gray-800">
          {isSidebarOpen && <span className="text-xl font-black text-white tracking-wider flex items-center"><span className="text-[#ff6a00] mr-1">VU68</span> ADMIN</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"><Menu size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {MENU_STRUCTURE.map((menu) => (
            <div key={menu.id} className="mb-1">
              {!menu.subItems ? (
                <div onClick={() => setActiveTab(menu.id)} className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${activeTab === menu.id ? 'bg-[#ff6a00] text-white border-r-4 border-white' : 'hover:bg-gray-800 hover:text-white'}`}>
                  <menu.icon size={20} className={isSidebarOpen ? 'mr-3' : 'mx-auto'} />
                  {isSidebarOpen && <span className="font-bold text-sm">{menu.label}</span>}
                </div>
              ) : (
                <>
                  <div onClick={() => { if(isSidebarOpen) toggleMenu(menu.id); else setIsSidebarOpen(true); }} className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800 hover:text-white transition-colors ${expandedMenus.includes(menu.id) ? 'text-white' : ''}`}>
                    <div className="flex items-center">
                      <menu.icon size={20} className={isSidebarOpen ? 'mr-3' : 'mx-auto'} />
                      {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-wider text-xs">{menu.label}</span>}
                    </div>
                    {isSidebarOpen && <ChevronDown size={16} className={`transition-transform duration-200 ${expandedMenus.includes(menu.id) ? 'rotate-180' : ''}`} />}
                  </div>
                  {isSidebarOpen && expandedMenus.includes(menu.id) && (
                    <div className="bg-gray-950 py-2">
                      {menu.subItems.map((sub) => (
                        <div key={sub.id} onClick={() => setActiveTab(sub.id)} className={`flex items-center pl-11 pr-4 py-2.5 cursor-pointer text-sm font-semibold transition-colors ${activeTab === sub.id ? 'text-[#ff6a00] bg-gray-900' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-3 ${activeTab === sub.id ? 'bg-[#ff6a00]' : 'bg-gray-600'}`}></div>
                          {sub.label}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
          <h1 className="text-xl font-black text-gray-800 uppercase tracking-wide">{MENU_STRUCTURE.flatMap(m => m.subItems || [m]).find(item => item.id === activeTab)?.label || 'Trang quản trị'}</h1>
          <div className="flex items-center space-x-4">
            <span className="font-bold text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">Sếp Tổng</span>
            <button onClick={handleLogout} className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm">Đăng xuất</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50 relative">
          
          {/* ================= DASHBOARD ================= */}
         {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Doanh Thu', value: `${dashboardStats.totalRevenue.toLocaleString('vi-VN')}đ`, color: 'bg-blue-50 text-blue-600', icon: BarChart3 }, 
                  { label: 'Tổng Đơn', value: dashboardStats.totalOrders.toString(), color: 'bg-orange-50 text-orange-600', icon: ShoppingCart }, 
                  { label: 'Tổng SP', value: dashboardStats.totalProducts.toString(), color: 'bg-emerald-50 text-emerald-600', icon: Package }, 
                  { label: 'Khách hàng', value: customers.length.toString(), color: 'bg-purple-50 text-purple-600', icon: Users }
                ].map((kpi, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase mb-1">{kpi.label}</p>
                      {/* Thêm style truncate để nhỡ tiền tỷ nó dài quá không bị tràn khung */}
                      <h3 className="text-2xl font-black text-gray-900 truncate max-w-[150px]" title={kpi.value}>{kpi.value}</h3>
                    </div>
                    <div className={`p-4 rounded-xl ${kpi.color} shrink-0`}>
                      <kpi.icon size={24} />
                    </div>
                  </div>
                ))}
              </div>

              {/* KHU VỰC BIỂU ĐỒ (Giữ nguyên 100% code gốc của sếp) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wide">Doanh Thu 7 Ngày Gần Nhất</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 'bold'}} />
                        <YAxis tickFormatter={(val) => `${Number(val) / 1000000}M`} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 'bold'}} />
                        <RechartsTooltip formatter={(value: unknown) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)} />
                        <Line type="monotone" dataKey="total" stroke="#ff6a00" strokeWidth={4} dot={{r: 6, fill: '#ff6a00', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wide">Top Sản Phẩm</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 'bold'}} />
                        <RechartsTooltip cursor={{fill: '#f9fafb'}} />
                        <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
        )}
          

          {/* ================= SẢN PHẨM ================= */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2 bg-white w-72 focus-within:border-[#ff6a00] transition-colors">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Tìm tên, mã sản phẩm..." className="bg-transparent border-none outline-none w-full text-sm" />
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#ff6a00] hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-lg flex items-center shadow-md">
                  <Plus size={18} className="mr-2" /> THÊM SẢN PHẨM
                </button>
              </div>

              <div className="overflow-x-auto min-h-[400px] relative">
                {isLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10"><Settings className="animate-spin text-[#ff6a00]" size={40} /></div>}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-black border-b border-gray-200">ID</th>
                      <th className="p-4 font-black border-b border-gray-200">Tên sản phẩm</th>
                      <th className="p-4 font-black border-b border-gray-200">Giá bán</th>
                      <th className="p-4 font-black border-b border-gray-200">Kho</th>
                      <th className="p-4 font-black border-b border-gray-200">Trạng thái</th>
                      <th className="p-4 font-black border-b border-gray-200 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-semibold text-gray-800">
                    {adminProducts.length === 0 && !isLoading ? (
                      <tr><td colSpan={6} className="text-center p-10 text-gray-400">Không tìm thấy dữ liệu từ Database!</td></tr>
                    ) : (
                      adminProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 border-b border-gray-100 group">
                          <td className="p-4 text-gray-400 text-xs uppercase">#{p.id?.substring(0,6) || 'N/A'}</td>
                          <td className="p-4 flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg mr-3 flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0">
                              <img src={p.imageUrl || "https://placehold.co/100x100/f8f9fa/a0aec0?text=IMG"} className="object-cover w-full h-full mix-blend-darken" alt={p.name} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-[14px] line-clamp-1 max-w-[300px]" title={p.name}>{p.name}</p>
                            </div>
                          </td>
                          <td className="p-4 text-red-600 font-black">{p.price?.toLocaleString('vi-VN')}đ</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full font-bold text-xs ${p.stockQuantity > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {p.stockQuantity || 0}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`flex items-center text-xs font-bold px-3 py-1 rounded-full w-max ${p.isDeleted ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                              {p.isDeleted ? <><EyeOff size={14} className="mr-1"/> Đã ẩn</> : <><Eye size={14} className="mr-1"/> Đang bán</>}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2 opacity-30 group-hover:opacity-100">
                              <button onClick={() => openEditModal(p)} className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm font-semibold text-gray-500 bg-gray-50/50">
                <span>Trang {currentPage} / {totalPages} (Tổng {totalProducts} sản phẩm)</span>
                <div className="flex space-x-1 overflow-x-auto max-w-[300px] sm:max-w-md">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50">Trước</button>
                  {[...Array(totalPages)].map((_, i) => {
                     if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)) {
                        return <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded shadow-sm border ${currentPage === i + 1 ? 'bg-[#ff6a00] text-white border-[#ff6a00]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>;
                     } else if (i + 1 === currentPage - 3 || i + 1 === currentPage + 3) return <span key={i} className="px-2 py-1">...</span>;
                     return null;
                  })}
                  <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50">Sau</button>
                </div>
              </div>
            </div>
          )}

          {/* ================= DANH MỤC ================= */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2 bg-white w-72 focus-within:border-blue-500 transition-colors">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Tìm tên danh mục..." className="bg-transparent border-none outline-none w-full text-sm" />
                </div>
                <button onClick={() => setIsAddCatModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center shadow-md">
                  <Plus size={18} className="mr-2" /> THÊM DANH MỤC
                </button>
              </div>

              <div className="overflow-x-auto min-h-[300px] relative">
                {isLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10"><Settings className="animate-spin text-blue-600" size={40} /></div>}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-black border-b border-gray-200 w-1/4">ID Danh Mục</th>
                      <th className="p-4 font-black border-b border-gray-200">Tên Danh Mục</th>
                      <th className="p-4 font-black border-b border-gray-200 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-semibold text-gray-800">
                    {categories.length === 0 && !isLoading ? (
                      <tr><td colSpan={3} className="text-center p-10 text-gray-400">Chưa có danh mục nào!</td></tr>
                    ) : (
                      categories.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-100 group">
                          <td className="p-4 text-gray-400 text-xs uppercase">{c.id}</td>
                          <td className="p-4 font-bold text-gray-900 text-[15px]">
                            <Folders size={18} className="inline mr-2 text-blue-500" /> {c.name}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2 opacity-30 group-hover:opacity-100">
                              <button onClick={() => openEditCatModal(c)} className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteCategory(c.id)} className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ĐƠN HÀNG (Dữ liệu thật) ================= */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex space-x-3">
                  <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2 bg-white w-64 focus-within:border-[#ff6a00] transition-colors">
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input type="text" placeholder="Tra cứu mã đơn (Data thật)..." className="bg-transparent border-none outline-none w-full text-sm" />
                  </div>
                  <button className="border border-gray-200 bg-white text-gray-600 font-bold px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 text-sm">
                    <Filter size={18} className="mr-2" /> Lọc trạng thái
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[400px] relative">
                {isLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10"><Settings className="animate-spin text-[#ff6a00]" size={40} /></div>}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-black border-b border-gray-200">Mã Đơn</th>
                      <th className="p-4 font-black border-b border-gray-200">Khách hàng</th>
                      <th className="p-4 font-black border-b border-gray-200">Ngày đặt</th>
                      <th className="p-4 font-black border-b border-gray-200">Tổng tiền</th>
                      <th className="p-4 font-black border-b border-gray-200">Trạng thái</th>
                      <th className="p-4 font-black border-b border-gray-200 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-semibold text-gray-800">
                    {orders.length === 0 && !isLoading ? (
                      <tr><td colSpan={6} className="text-center p-10 text-gray-400">Chưa có đơn hàng nào trong Database C#!</td></tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50 border-b border-gray-100 group">
                          <td className="p-4 text-[#ff6a00] font-black">#{o.id?.substring(0,8) || 'N/A'}</td>
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{o.customerName || 'Khách vãng lai'}</p>
                            <p className="text-xs text-gray-400">{o.phoneNumber || 'Không có SĐT'}</p>
                          </td>
                          <td className="p-4 text-gray-500">
                             {/* FIX LỖI DATE.NOW() TẠI ĐÂY */}
                             {o.orderDate ? new Date(o.orderDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
                          </td>
                          <td className="p-4 font-black text-gray-900">
                            {(o.totalAmount || 0).toLocaleString()}đ <span className="text-xs text-gray-400 font-medium">({o.orderItems?.length || 0} sp)</span>
                          </td>
                          {/* ĐÂY LÀ DROPDOWN CHỌN TRẠNG THÁI MỚI */}
                          <td className="p-4">
                            <select
    // 1. DỊCH TỪ CHỮ CỦA BACKEND SANG SỐ CHO DROPDOWN HIỂU
    value={
        ['1', 'shipping', 'processing'].includes(o.status?.toString().toLowerCase()) ? "1" :
        ['2', 'completed', 'delivered'].includes(o.status?.toString().toLowerCase()) ? "2" :
        ['3', 'cancelled'].includes(o.status?.toString().toLowerCase()) ? "3" : "0"
    }
    
    // 2. ÉP KIỂU VỀ SỐ NGUYÊN KHI GỬI LÊN LẠI CHO BACKEND (Đã fix lỗi TypeScript)
    onChange={(e) => handleUpdateOrderStatus(o.id, parseInt(e.target.value).toString())} 
    
    // 3. TÔ MÀU THEO ĐÚNG TRẠNG THÁI (Em đã rút gọn code lại cho sếp dễ nhìn)
    className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer border-2 transition-colors
        ${['0', 'pending'].includes(o.status?.toString().toLowerCase()) ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
        ${['1', 'shipping', 'processing'].includes(o.status?.toString().toLowerCase()) ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
        ${['2', 'completed', 'delivered'].includes(o.status?.toString().toLowerCase()) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
        ${['3', 'cancelled'].includes(o.status?.toString().toLowerCase()) ? 'bg-red-50 text-red-700 border-red-200' : ''}
    `}
>
    <option value="0" className="bg-white text-gray-800">Chờ xác nhận</option>
    <option value="1" className="bg-white text-gray-800">Đang giao</option>
    <option value="2" className="bg-white text-gray-800">Đã giao</option>
    <option value="3" className="bg-white text-gray-800">Đã hủy</option>
</select>
                          </td>
                          <td className="p-4 text-right">
    <button onClick={() => openOrderDetails(o)} className="px-3 py-1.5 bg-gray-100 hover:bg-[#ff6a00] hover:text-white text-gray-600 rounded font-bold text-xs transition-colors">
      Xem chi tiết
    </button>
  </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= KHÁCH HÀNG (Dữ liệu thật) ================= */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2 bg-white w-72 focus-within:border-blue-500 transition-colors">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Tìm tên khách (Data thật)..." className="bg-transparent border-none outline-none w-full text-sm" />
                </div>
              </div>
              <div className="overflow-x-auto min-h-[400px] relative">
                {isLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10"><Settings className="animate-spin text-blue-600" size={40} /></div>}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-black border-b border-gray-200">Khách hàng</th>
                      <th className="p-4 font-black border-b border-gray-200">Liên hệ</th>
                      <th className="p-4 font-black border-b border-gray-200">Phân quyền</th>
                      <th className="p-4 font-black border-b border-gray-200">Trạng thái</th>
                      <th className="p-4 font-black border-b border-gray-200 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-semibold text-gray-800">
                    {customers.length === 0 && !isLoading ? (
                      <tr><td colSpan={5} className="text-center p-10 text-gray-400">Không load được Users! (Sếp check lại API /api/Auth/users bên C# nhé)</td></tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-100 group">
                          <td className="p-4 flex items-center">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full mr-3 flex items-center justify-center font-black">
                              {(c.userName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-900">{c.userName || 'User'}</span>
                          </td>
                          <td className="p-4">
                            <p className="text-gray-900">{c.phoneNumber || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{c.email}</p>
                          </td>
                          <td className="p-4">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
                              {c.roles?.join(', ') || 'User'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`w-2.5 h-2.5 rounded-full inline-block mr-2 ${c.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {c.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                          </td>
                          <td className="p-4 text-right">
                            <button className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg" title="Lịch sử"><History size={16} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ĐÁNH GIÁ (Chưa có API) ================= */}
          {activeTab !== 'dashboard' && activeTab !== 'products' && activeTab !== 'categories' && activeTab !== 'orders' && activeTab !== 'customers' && (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 animate-in fade-in duration-300">
              <h2 className="text-2xl font-black text-gray-800">Module Đánh Giá chưa có Database C#!</h2>
              <p className="text-gray-500 mt-2">Sếp viết xong `Review.cs` và `ReviewController.cs` thì ới em em nối cho nhé!</p>
            </div>
          )}
        </main>

        {/* ================= CÁC MODAL THÊM / SỬA (Giữ nguyên) ================= */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between"><h2 className="text-lg font-black uppercase">Thêm Sản Phẩm Mới</h2><button onClick={() => setIsAddModalOpen(false)}><X size={24} /></button></div>
              <div className="p-6"><form id="addForm" onSubmit={handleAddProduct} className="space-y-5"><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Tên sản phẩm *" /><div className="grid grid-cols-2 gap-5"><input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Giá bán *" /><input required type="number" value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Số lượng kho *" /></div><select required value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} className="w-full border p-2 rounded-lg">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="text" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="URL Ảnh" /><textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Mô tả chi tiết" /></form></div>
              <div className="px-6 py-4 border-t flex justify-end space-x-3"><button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold border">Hủy</button><button type="submit" form="addForm" className="px-5 py-2.5 rounded-lg font-bold text-white bg-[#ff6a00]">Lưu</button></div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border-t-4 border-blue-500">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between"><h2 className="text-lg font-black uppercase text-blue-600">Sửa Sản Phẩm</h2><button onClick={() => setIsEditModalOpen(false)}><X size={24} /></button></div>
              <div className="p-6"><form id="editForm" onSubmit={handleUpdateProduct} className="space-y-5"><div><label className="block text-sm font-bold mb-1">Tên sản phẩm</label><input required type="text" value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})} className="w-full border p-2 rounded-lg" /></div><div className="grid grid-cols-2 gap-5"><div><label className="block text-sm font-bold mb-1">Giá bán</label><input required type="number" value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: e.target.value})} className="w-full border p-2 rounded-lg" /></div><div><label className="block text-sm font-bold mb-1">Kho</label><input required type="number" value={editProduct.stockQuantity} onChange={e => setEditProduct({...editProduct, stockQuantity: e.target.value})} className="w-full border p-2 rounded-lg" /></div></div><div><label className="block text-sm font-bold mb-1">Danh mục</label><select required value={editProduct.categoryId} onChange={e => setEditProduct({...editProduct, categoryId: e.target.value})} className="w-full border p-2 rounded-lg">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="block text-sm font-bold mb-1">Hình ảnh</label><input type="text" value={editProduct.imageUrl} onChange={e => setEditProduct({...editProduct, imageUrl: e.target.value})} className="w-full border p-2 rounded-lg" /></div></form></div>
              <div className="px-6 py-4 border-t flex justify-end space-x-3"><button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold border">Hủy</button><button type="submit" form="editForm" className="px-5 py-2.5 rounded-lg font-bold text-white bg-blue-600">Cập Nhật</button></div>
            </div>
          </div>
        )}

        {isAddCatModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between"><h2 className="text-lg font-black uppercase">Thêm Danh Mục</h2><button onClick={() => setIsAddCatModalOpen(false)}><X size={24} /></button></div>
              <div className="p-6"><form id="addCatForm" onSubmit={handleAddCategory} className="space-y-5"><input required autoFocus type="text" value={newCategory.name} onChange={e => setNewCategory({name: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="Tên danh mục *" /></form></div>
              <div className="px-6 py-4 border-t flex justify-end space-x-3"><button onClick={() => setIsAddCatModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold border">Hủy</button><button type="submit" form="addCatForm" className="px-5 py-2.5 rounded-lg font-bold text-white bg-blue-600">Lưu</button></div>
            </div>
          </div>
        )}

        {isEditCatModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border-t-4 border-blue-500">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between"><h2 className="text-lg font-black uppercase text-blue-600">Sửa Danh Mục</h2><button onClick={() => setIsEditCatModalOpen(false)}><X size={24} /></button></div>
              <div className="p-6"><form id="editCatForm" onSubmit={handleUpdateCategory} className="space-y-5"><div><label className="block text-sm font-bold mb-1">Tên danh mục</label><input required type="text" value={editCategory.name} onChange={e => setEditCategory({...editCategory, name: e.target.value})} className="w-full border p-2 rounded-lg focus:border-blue-500" /></div></form></div>
              <div className="px-6 py-4 border-t flex justify-end space-x-3"><button onClick={() => setIsEditCatModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold border">Hủy</button><button type="submit" form="editCatForm" className="px-5 py-2.5 rounded-lg font-bold text-white bg-blue-600">Cập Nhật</button></div>
            </div>
          </div>
        )}

        {/* ================= MODAL CHI TIẾT ĐƠN HÀNG ================= */}
        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border-t-4 border-[#ff6a00]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-black uppercase text-[#ff6a00]">Chi Tiết Đơn Hàng #{selectedOrder.id?.substring(0,8)}</h2>
                <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                
                {/* Thông tin khách & Ngày tháng */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Khách hàng</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.customerName || 'Khách vãng lai'}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.phoneNumber || 'Không có SĐT'}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Ngày đặt hàng</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-1">Trạng thái: {selectedOrder.status?.toString() === '2' ? 'Hoàn thành' : 'Đang xử lý'}</p>
                  </div>
                </div>

                {/* Danh sách sản phẩm mua */}
                <h3 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center"><Package size={18} className="mr-2"/> Sản phẩm đã đặt</h3>
                <table className="w-full text-left border-collapse mb-4">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                      <th className="p-3 rounded-tl-lg">Sản phẩm</th>
                      <th className="p-3 text-center">S.Lượng</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-right rounded-tr-lg">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!selectedOrder.orderItems || selectedOrder.orderItems.length === 0) ? (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-500 font-medium bg-gray-50 rounded-b-lg">Chưa có chi tiết sản phẩm từ API C# (Sếp check lại Backend nhé!)</td></tr>
                    ) : (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      selectedOrder.orderItems.map((item: any, idx) => {
                        const price = item.price || item.unitPrice || 0;
                        const qty = item.quantity || 1;
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 font-semibold text-gray-800 text-sm">{item.productName || `Sản phẩm ${idx + 1}`}</td>
                            <td className="p-3 text-center font-bold text-gray-600">{qty}</td>
                            <td className="p-3 text-right text-gray-500">{price.toLocaleString('vi-VN')}đ</td>
                            <td className="p-3 text-right font-black text-[#ff6a00]">{(qty * price).toLocaleString('vi-VN')}đ</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>

                {/* Tổng tiền */}
                <div className="flex justify-end mt-2">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 w-1/2 text-right">
                    <span className="font-bold text-gray-600 uppercase text-sm mr-4">Tổng cộng:</span>
                    <span className="text-2xl font-black text-[#ff6a00]">{(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
                <button onClick={() => setIsOrderModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm">
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}