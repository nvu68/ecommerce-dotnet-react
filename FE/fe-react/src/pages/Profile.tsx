import React, { useState } from 'react';
import { User, MapPin, Lock, Camera, Save, LogOut, Package } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'password'>('info');
  const [isLoading, setIsLoading] = useState(false);

  // Giả lập state chứa thông tin user
  const [userInfo, setUserInfo] = useState({
    fullName: 'Nguyễn Quốc Vũ',
    email: 'vu68@gmail.com',
    phone: '0987654321',
    gender: 'male',
    dob: '2000-01-01'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.assign('/login');
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Giả lập gọi API cập nhật
    setTimeout(() => {
      setIsLoading(false);
      alert('Cập nhật thông tin thành công!');
    }, 1000);
  };

  return (
    <div className="bg-[#f4f7fa] min-h-screen py-10 px-4 md:px-8 font-sans text-gray-800">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8">
        
        {/* ================= SIDEBAR TRÁI ================= */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            
            {/* Avatar & Tên */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff8c00] to-[#ff6a00] p-1 shadow-lg">
                  <div className="w-full h-full rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    <User size={40} className="text-gray-400" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="font-black text-xl text-gray-900">{userInfo.fullName}</h3>
              <p className="text-sm text-gray-500 font-medium">{userInfo.email}</p>
            </div>

            {/* Menu Tabs */}
            <nav className="p-3 space-y-1">
              <button 
                onClick={() => setActiveTab('info')} 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${activeTab === 'info' ? 'bg-orange-50 text-[#ff6a00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User size={18} /> <span>Hồ sơ cá nhân</span>
              </button>
              <button 
                onClick={() => setActiveTab('address')} 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${activeTab === 'address' ? 'bg-orange-50 text-[#ff6a00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <MapPin size={18} /> <span>Quản lý địa chỉ</span>
              </button>
              <button 
                onClick={() => window.location.assign('/my-orders')} 
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                <Package size={18} /> <span>Đơn hàng của tôi</span>
              </button>
              <button 
                onClick={() => setActiveTab('password')} 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${activeTab === 'password' ? 'bg-orange-50 text-[#ff6a00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Lock size={18} /> <span>Đổi mật khẩu</span>
              </button>
              
              <div className="pt-4 mt-2 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold text-sm text-red-500 hover:bg-red-50 transition">
                  <LogOut size={18} /> <span>Đăng xuất</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* ================= NỘI DUNG CHÍNH (PHẢI) ================= */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
            
            {/* TAB: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'info' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Hồ Sơ Của Tôi</h2>
                <p className="text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

                <form onSubmit={handleSaveInfo} className="max-w-2xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Họ và Tên</label>
                      <input type="text" value={userInfo.fullName} onChange={e => setUserInfo({...userInfo, fullName: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-lg text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                      <input type="tel" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-lg text-gray-700" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email (Không thể thay đổi)</label>
                    <input type="email" disabled value={userInfo.email} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 outline-none rounded-lg text-gray-500 cursor-not-allowed" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                      <input type="date" value={userInfo.dob} onChange={e => setUserInfo({...userInfo, dob: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-lg text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Giới tính</label>
                      <div className="flex space-x-6 items-center h-12">
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="gender" checked={userInfo.gender === 'male'} onChange={() => setUserInfo({...userInfo, gender: 'male'})} className="w-4 h-4 text-[#ff6a00] focus:ring-[#ff6a00] cursor-pointer"/> <span className="font-medium text-gray-700">Nam</span></label>
                        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="gender" checked={userInfo.gender === 'female'} onChange={() => setUserInfo({...userInfo, gender: 'female'})} className="w-4 h-4 text-[#ff6a00] focus:ring-[#ff6a00] cursor-pointer"/> <span className="font-medium text-gray-700">Nữ</span></label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" disabled={isLoading} className="bg-[#ff6a00] hover:bg-[#e55f00] text-white font-bold py-3.5 px-8 rounded-lg transition shadow-md flex items-center space-x-2 disabled:bg-gray-400">
                      <Save size={18} /> <span>{isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: QUẢN LÝ ĐỊA CHỈ */}
            {activeTab === 'address' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-black text-gray-900">Địa Chỉ Của Tôi</h2>
                  <button className="bg-[#ff6a00] hover:bg-[#e55f00] text-white font-bold py-2 px-4 rounded transition text-sm">+ Thêm địa chỉ mới</button>
                </div>
                <p className="text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">Quản lý địa chỉ giao hàng</p>

                <div className="border border-gray-200 rounded-xl p-5 hover:border-[#ff6a00] transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-bold text-gray-900 text-lg">Nguyễn Quốc Vũ</h4>
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">0987 654 321</span>
                    </div>
                    <div className="flex space-x-3 text-sm font-semibold">
                      <button className="text-blue-500 hover:text-blue-700">Cập nhật</button>
                      <button className="text-red-500 hover:text-red-700">Xóa</button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Trường Đại học Công nghiệp Hà Nội</p>
                  <p className="text-gray-600 text-sm mb-3">Phường Minh Khai, Quận Bắc Từ Liêm, Hà Nội</p>
                  <span className="border border-[#ff6a00] text-[#ff6a00] text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">Mặc định</span>
                </div>
              </div>
            )}

            {/* TAB: ĐỔI MẬT KHẨU */}
            {activeTab === 'password' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Đổi Mật Khẩu</h2>
                <p className="text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">Bảo mật tài khoản bằng mật khẩu mạnh</p>

                <form className="max-w-md space-y-5">
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label><input type="password" required className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-lg text-gray-700" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label><input type="password" required className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-lg text-gray-700" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label><input type="password" required className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-lg text-gray-700" /></div>
                  
                  <div className="pt-4">
                    <button type="submit" className="bg-[#ff6a00] hover:bg-[#e55f00] text-white font-bold py-3.5 px-8 rounded-lg transition shadow-md w-full">Cập Nhật Mật Khẩu</button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}