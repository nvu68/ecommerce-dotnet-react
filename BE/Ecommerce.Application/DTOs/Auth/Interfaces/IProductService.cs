using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Ecommerce.Application.DTOs.Product;

namespace Ecommerce.Application.Interfaces;

public interface IProductService
{
    Task<PagedResultDto<ProductResponseDto>> GetAllProductsAsync(ProductQueryDto query);
    Task<ProductResponseDto?> GetByIdAsync(Guid id);
    Task<ProductResponseDto> CreateAsync(ProductRequestDto request);
    Task UpdateAsync(Guid id, ProductRequestDto request);
    Task DeleteAsync(Guid id);
}
