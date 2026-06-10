import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://ecommerce-dotnet-react-1.onrender.com/api';

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', otp: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp sếp ơi!'); return;
    }
    if (!isCaptchaChecked) {
      setError('Vui lòng xác nhận CAPTCHA!'); return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/Auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      alert('🎉 Đăng ký thành công! Chào mừng gia nhập VU68.');
      window.location.assign('/login'); 
    } catch (err) {
      console.error(err); // Vừa xài biến err, vừa bỏ luôn chữ ': any'
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Đăng ký thất bại! Email hoặc SĐT này có thể đã được sử dụng.');
      } else {
        setError('Đăng ký thất bại! Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[70vh] flex flex-col items-center pt-16 pb-16">
      <div className="w-full max-w-lg px-8">
        
        <h2 className="text-[32px] font-bold text-gray-900 mb-8 text-center">Tạo Tài Khoản Mới</h2>

        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r"><p className="font-medium text-sm">{error}</p></div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Họ và Tên <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700" placeholder="VD: Nguyễn Văn Vũ" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email <span className="text-red-500">*</span></label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700" placeholder="abc@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Số điện thoại</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700" placeholder="0987654321" />
            </div>
          </div>

          {/* TÍNH NĂNG OTP (Đang tắt required để test) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mã xác thực OTP <span className="text-gray-400 font-normal text-xs">(Bỏ qua khi test)</span>
            </label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                // Đã xóa chữ 'required' ở đây
                value={formData.otp} 
                onChange={e => setFormData({...formData, otp: e.target.value})} 
                className="flex-1 px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700 tracking-widest" 
                placeholder="Nhập 6 số OTP" 
              />
              <button type="button" className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md font-semibold text-gray-700 transition text-sm whitespace-nowrap">
                Gửi mã OTP
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Mật khẩu <span className="text-red-500">*</span></label>
              <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700" placeholder="Tối thiểu 6 ký tự" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Xác nhận <span className="text-red-500">*</span></label>
              <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#ff6a00] outline-none transition rounded-md text-gray-700" placeholder="Nhập lại mật khẩu" />
            </div>
          </div>

          {/* TÍNH NĂNG CAPTCHA (Giả lập UI) */}
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="captcha" checked={isCaptchaChecked} onChange={() => setIsCaptchaChecked(!isCaptchaChecked)} className="w-6 h-6 cursor-pointer" />
              <label htmlFor="captcha" className="text-sm font-semibold text-gray-700 cursor-pointer">Tôi không phải là người máy</label>
            </div>
            <div className="text-right">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/ad/RecaptchaLogo.svg" alt="reCAPTCHA" className="h-6 opacity-60" />
              <p className="text-[10px] text-gray-400 mt-1">Bảo mật bởi Google</p>
            </div>
          </div>

          <div className="pt-4">
            <button disabled={isLoading} type="submit" className={`w-full text-white font-bold py-3.5 rounded-md transition shadow-md uppercase text-sm ${isLoading ? 'bg-gray-400' : 'bg-[#ff6a00] hover:bg-[#e55f00]'}`}>
              {isLoading ? 'Đang xử lý...' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Đã có tài khoản? <span onClick={() => window.location.assign('/login')} className="text-[#ff6a00] hover:underline cursor-pointer font-bold">Đăng nhập ngay</span>
        </div>

      </div>
    </div>
  );
}