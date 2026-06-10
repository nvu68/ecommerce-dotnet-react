import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const response = await axios.post('https://ecommerce-dotnet-react-1.onrender.com/api/Auth/login', {
          email: username,
          password: password
        });

        const token = response.data.token || response.data; 
        localStorage.setItem('token', token);

        try {
          let role = response.data.role;
          if (!role && token) {
            const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(payloadBase64)); 
            role = payload.role || payload.Role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          }
          if (role) localStorage.setItem('role', role);

          if (role === 'Admin') {
            window.location.assign('/admin'); 
          } else {
            window.location.assign('/');      
          }
        } catch (err) {
          console.error(err); // Thêm dòng này để xài biến err
          window.location.assign('/');
        }
      } catch (err) {
        console.error(err); // Thêm dòng này để xài biến err
        setError('Đăng nhập thất bại! Sai Email/Username hoặc Mật khẩu.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="bg-white min-h-[70vh] flex flex-col items-center pt-20 pb-16">
      <div className="w-full max-w-md px-8">
        
        <h2 className="text-[32px] font-bold text-gray-900 mb-8 text-center">Đăng nhập</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email hoặc Username <span className="text-red-500">*</span></label>
            <input 
              type="text" required
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700"
              placeholder="Nhập Email hoặc Username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Mật khẩu <span className="text-red-500">*</span></label>
            <input 
              type="password" required
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 text-[#ff6a00] border-gray-300 rounded focus:ring-[#ff6a00] cursor-pointer" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">Ghi nhớ đăng nhập</label>
            </div>
            {/* TÍNH NĂNG QUÊN MẬT KHẨU */}
            <span className="text-sm text-[#ff6a00] hover:underline cursor-pointer font-medium">Quên mật khẩu?</span>
          </div>

          <div className="pt-2">
            <button disabled={isLoading} type="submit" className={`w-full text-white font-bold py-3.5 rounded-md transition shadow-md uppercase text-sm ${isLoading ? 'bg-gray-400' : 'bg-[#ff6a00] hover:bg-[#e55f00]'}`}>
              {isLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY'}
            </button>
          </div>
        </form>
        
        {/* ĐĂNG NHẬP BẰNG MẠNG XÃ HỘI */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng</span></div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition">
              <span className="font-bold text-gray-700">Google</span>
            </button>
            <button className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition">
              <span className="font-bold text-blue-600">Facebook</span>
            </button>
            <button className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition">
              <span className="font-bold text-gray-900">GitHub</span>
            </button>
          </div>
        </div>

        {/* LINK CHUYỂN SANG ĐĂNG KÝ */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản? <span onClick={() => window.location.assign('/register')} className="text-[#ff6a00] hover:underline cursor-pointer font-bold">Đăng ký tại đây</span>
        </div>

      </div>
    </div>
  );
}