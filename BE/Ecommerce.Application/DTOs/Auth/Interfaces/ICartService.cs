using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Ecommerce.Application.DTOs.Cart;

namespace Ecommerce.Application.Interfaces;

public interface ICartService
{
    Task AddToCartAsync(Guid userId, AddToCartRequestDto request);
    Task<IEnumerable<CartItemResponseDto>> GetCartAsync(Guid userId);
    Task RemoveItemAsync(Guid userId, Guid productId);
}