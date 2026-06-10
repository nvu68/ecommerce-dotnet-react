import { MapPin, Phone, ShoppingCart } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="bg-[#fafafa] pt-16 pb-8 border-t border-gray-200 mt-12 w-full">
      {/* KHU VỰC ĐĂNG KÝ NHẬN TIN */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-16 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Chúng tôi luôn sẵn sàng <span className="text-[#ff6a00]">hỗ trợ</span></h2>
          <p className="text-gray-500 font-medium">Để được tư vấn thông tin với các chuyên gia của chúng tôi</p>
        </div>
        <div className="flex w-full md:w-[500px] shadow-sm rounded-md overflow-hidden">
          <input type="email" placeholder="Nhập Email của bạn..." className="flex-1 px-6 py-4 outline-none border border-gray-200 focus:border-[#ff6a00] transition text-sm" />
          <button className="bg-[#ff6a00] hover:bg-[#e55f00] text-white px-8 font-bold transition text-sm">ĐĂNG KÝ</button>
        </div>
      </div>

      {/* CÁC CỘT LIÊN KẾT */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Cột 1: Thông tin liên hệ */}
        <div>
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-[#ff8c00] to-[#ff6a00] p-2 rounded-lg mr-3 shadow-md">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-gray-900 leading-none">VU68</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Siêu Thị Điện Máy</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4 flex items-start"><MapPin size={16} className="mr-2 mt-1 flex-shrink-0 text-[#ff6a00]"/> Hanoi University of Industry (HaUI), Bắc Từ Liêm, Hà Nội, Việt Nam</p>
          <p className="text-gray-500 text-sm mb-6 flex items-center"><Phone size={16} className="mr-2 text-[#ff6a00]"/> 1900 6868</p>
          <div className="flex space-x-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-8 cursor-pointer hover:opacity-80 transition" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8 cursor-pointer hover:opacity-80 transition" />
          </div>
        </div>

        {/* Cột 2 */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 text-lg">Tìm kiếm nhanh</h4>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Laptop & Máy tính</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Camera & Nhiếp ảnh</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Điện thoại thông minh</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Video Games & Console</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">TV & Âm thanh</li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 text-lg">Liên kết nhanh</h4>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Tài khoản của bạn</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Đổi trả hàng</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Trung tâm hoàn tiền</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Lịch sử mua hàng</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition">Tải ứng dụng</li>
          </ul>
        </div>

        {/* Cột 4 */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 text-lg">Dịch vụ khách hàng</h4>
          <ul className="space-y-3 text-sm text-gray-500 font-medium">
            <li className="hover:text-[#ff6a00] cursor-pointer transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span> Trung tâm hỗ trợ</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span> Điều khoản & Điều kiện</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span> Chính sách giao hàng</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span> Chính sách bảo mật</li>
            <li className="hover:text-[#ff6a00] cursor-pointer transition flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span> Câu hỏi thường gặp</li>
          </ul>
        </div>
      </div>

      {/* BẢN QUYỀN VÀ MẠNG XÃ HỘI */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2026 <span className="text-[#ff6a00] font-bold">VU68</span>. All Rights Reserved.</p>
        <div className="flex space-x-6 mb-4 md:mb-0 text-gray-500 font-bold text-sm">
          <span className="hover:text-[#ff6a00] cursor-pointer transition">Facebook</span>
          <span className="hover:text-[#ff6a00] cursor-pointer transition">Twitter</span>
          <span className="hover:text-[#ff6a00] cursor-pointer transition">Instagram</span>
          <span className="hover:text-[#ff6a00] cursor-pointer transition">Youtube</span>
        </div>
        <div className="flex space-x-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
        </div>
      </div>
    </footer>
  );
}