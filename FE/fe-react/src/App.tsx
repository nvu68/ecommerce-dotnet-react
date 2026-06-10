import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin'; 
import ProductDetail from './pages/ProductDetail';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute'; 
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';


// MỚI THÊM: Import cái kho chứa Tim
import { WishlistProvider } from './store/WishlistContext'; 

function App() {
  return (
    // MỚI THÊM: Bọc WishlistProvider ôm lấy toàn bộ App
    <WishlistProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-orders" element={<MyOrders />} />
              
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </WishlistProvider>
  );
}

export default App;