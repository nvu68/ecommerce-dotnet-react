using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Ecommerce.Application.DTOs.Cart;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;

namespace Ecommerce.Application.Services;

public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;

    public CartService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task AddToCartAsync(Guid userId, AddToCartRequestDto request)
    {
        // 1. Kiểm tra sản phẩm có tồn tại và đủ hàng không
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(request.ProductId);
        if (product == null) throw new Exception("Không tìm thấy sản phẩm!");
        if (product.Stock < request.Quantity) throw new Exception($"Chỉ còn {product.Stock} sản phẩm trong kho!");

        // 2. Tìm giỏ hàng của User này (Nếu chưa có thì tạo mới)
        var carts = await _unitOfWork.Repository<Cart>().GetAllAsync();
        var cart = carts.FirstOrDefault(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _unitOfWork.Repository<Cart>().AddAsync(cart);
            await _unitOfWork.SaveChangesAsync(); // Lưu để lấy Cart.Id
        }

        // 3. Xử lý Thêm vào giỏ (Nếu món này có trong giỏ rồi thì cộng dồn số lượng)
        var cartItems = await _unitOfWork.Repository<CartItem>().GetAllAsync();
        var existingItem = cartItems.FirstOrDefault(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            _unitOfWork.Repository<CartItem>().Update(existingItem);
        }
        else
        {
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            await _unitOfWork.Repository<CartItem>().AddAsync(newItem);
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<CartItemResponseDto>> GetCartAsync(Guid userId)
    {
        var carts = await _unitOfWork.Repository<Cart>().GetAllAsync();
        var cart = carts.FirstOrDefault(c => c.UserId == userId);

        // Nếu user chưa có giỏ hàng, trả về danh sách rỗng
        if (cart == null) return new List<CartItemResponseDto>();

        var allCartItems = await _unitOfWork.Repository<CartItem>().GetAllAsync();
        var userCartItems = allCartItems.Where(ci => ci.CartId == cart.Id).ToList();

        var allProducts = await _unitOfWork.Repository<Product>().GetAllAsync();

        var result = new List<CartItemResponseDto>();
        foreach (var item in userCartItems)
        {
            var product = allProducts.FirstOrDefault(p => p.Id == item.ProductId);
            if (product != null)
            {
                result.Add(new CartItemResponseDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Price = product.Price,
                    Quantity = item.Quantity
                });
            }
        }

        return result;
    }

    public async Task RemoveItemAsync(Guid userId, Guid productId)
    {
        // 1. Tìm cái giỏ hàng của ông User này trước (Chỉ truyền đúng 1 tham số thôi)
        var cartRepo = _unitOfWork.Repository<Cart>();
        var cart = await cartRepo.GetFirstOrDefaultAsync(c => c.UserId == userId);

        if (cart != null)
        {
            // 2. Tìm thẳng vào bảng chi tiết giỏ hàng (CartItem)
            // LƯU Ý: Sếp ngó lại xem Entity chi tiết của sếp tên là CartItem hay CartDetail nhé, em đang để chuẩn là CartItem.
            var cartItemRepo = _unitOfWork.Repository<CartItem>();

            // Tìm cái món hàng nằm trong Giỏ (CartId) này và đúng Mã Sản Phẩm (ProductId) sếp muốn xóa
            var itemToRemove = await cartItemRepo.GetFirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == productId);

            if (itemToRemove != null)
            {
                // 3. Trảm nó và lưu lại 
                // (Nếu sếp gõ cartItemRepo. mà không thấy chữ Remove, thì thử chữ Delete nhé)
                cartItemRepo.Remove(itemToRemove);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
}
