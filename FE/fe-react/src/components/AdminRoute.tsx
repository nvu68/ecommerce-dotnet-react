import { Navigate } from 'react-router-dom';
import React from 'react';

// Component này đóng vai trò như bảo vệ quán bar
export default function AdminRoute({ children }: { children: React.ReactNode }) {
      const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Lúc đăng nhập mình đã lưu role vào đây

  // 1. Nếu chưa có token -> Đuổi ra trang đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có token nhưng không phải sếp (Admin) -> Đuổi ra trang chủ mua hàng
  if (role !== 'Admin') {
    alert('Cảnh báo: Bạn không có quyền vào khu vực Quản trị!');
    return <Navigate to="/" replace />;
  }

  // 3. Đúng là sếp -> Trải thảm đỏ cho vào (render children)
  return children;
}