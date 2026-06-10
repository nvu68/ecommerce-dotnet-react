import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Eye, Clock, CheckCircle, Truck, XCircle, ChevronRight, X } from 'lucide-react';

const API_BASE_URL = 'https://ecommerce-dotnet-react-1.onrender.com/api';

interface OrderItem { productId: string; productName: string; quantity: number; price: number; }
interface Order { id: number | string; orderDate: string;  totalAmount: number; status: string; createdAt: string; shippingAddress: string; note: string; orderItems?: OrderItem[]; }

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.assign('/login');
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/Order/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedOrders = Array.isArray(res.data) ? res.data : res.data.items || [];
        
        // CẬP NHẬT: Dùng orderDate để sắp xếp thay vì createdAt
        const sorted = fetchedOrders.sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(sorted);
      } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  // Hàm render màu sắc và Icon theo trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14} className="mr-1"/> Chờ xác nhận</span>;
      case 'Processing': return <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold"><Package size={14} className="mr-1"/> Đang xử lý</span>;
      case 'Shipped': return <span className="flex items-center text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold"><Truck size={14} className="mr-1"/> Đang giao hàng</span>;
      case 'Delivered': return <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} className="mr-1"/> Hoàn thành</span>;
      case 'Cancelled': return <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={14} className="mr-1"/> Đã hủy</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="bg-[#f4f7fa] min-h-[80vh] py-10 px-4 md:px-8 font-sans">
      <div className="max-w-[1000px] mx-auto">
        
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-[#ff6a00] text-white rounded-xl shadow-lg"><Package size={28} /></div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Đơn Hàng Của Tôi</h1>
            <p className="text-gray-500 text-sm font-medium">Theo dõi và quản lý các giao dịch của bạn</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40 text-gray-400 font-bold animate-pulse">Đang tải dữ liệu đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
            <img src="https://placehold.co/150x150/f8f9fa/cccccc?text=No+Orders" alt="Trống" className="mb-4 rounded-full mix-blend-multiply" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa có đơn hàng nào</h3>
            <p className="text-gray-500 mb-6">Hãy dạo quanh cửa hàng và chọn cho mình những sản phẩm ưng ý nhé!</p>
            <button onClick={() => window.location.assign('/')} className="bg-[#ff6a00] hover:bg-[#e55f00] text-white font-bold py-3 px-8 rounded-full transition shadow-lg">Tiếp Tục Mua Sắm</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-black text-lg text-gray-900">Mã đơn: #{order.id.toString().substring(0, 8).toUpperCase()}</span>
                      {/* Đảm bảo sếp đã có hàm getStatusBadge ở trên */}
                      {getStatusBadge(order.status || 'Pending')}
                    </div>
                    {/* CẬP NHẬT: Dùng orderDate */}
                    <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500 mb-1">Tổng tiền thanh toán</p>
                    <p className="text-2xl font-black text-[#ff6a00]">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p><span className="font-semibold">Giao đến:</span> {order.shippingAddress || 'Khách hàng nhận tại cửa hàng'}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                  >
                    <Eye size={16} /> <span>Xem Chi Tiết</span> <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-black text-gray-900">Chi Tiết Đơn Hàng #{selectedOrder.id.toString().substring(0, 8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Trạng thái */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Trạng thái hiện tại:</span>
                {getStatusBadge(selectedOrder.status || 'Pending')}
              </div>

              {/* Thông tin nhận hàng */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Thông tin nhận hàng</h3>
                <div className="text-sm text-gray-600 space-y-2">
<p className="text-sm text-gray-600 mb-1">Địa chỉ: <span className="font-semibold text-gray-800">{selectedOrder.shippingAddress || 'Khách hàng nhận tại cửa hàng'}</span></p>
<p className="text-sm text-gray-600">Thời gian đặt: <span className="font-semibold text-gray-800">{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString('vi-VN') : 'Không xác định'}</span></p>                  {selectedOrder.note && <p className="text-orange-600 bg-orange-50 p-2 rounded mt-2"><span className="font-medium">Ghi chú:</span> {selectedOrder.note}</p>}
                </div>
              </div>

              {/* Danh sách sản phẩm (Nếu API có trả về OrderItems) */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Sản phẩm đã mua</h3>
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Hóa đơn này được tạo trước khi hệ thống lưu chi tiết sản phẩm.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Tổng cộng:</span>
              <span className="text-2xl font-black text-[#ff6a00]">{selectedOrder.totalAmount?.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}