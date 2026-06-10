using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Ecommerce.Application.DTOs.Product;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;

namespace Ecommerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResultDto<ProductResponseDto>> GetAllProductsAsync(ProductQueryDto query)
    {
        // 1. Lấy toàn bộ data (Thực tế làm IQueryable sẽ tối ưu hơn, nhưng ta dùng tạm IEnumerable cho dễ hiểu)
        var allProducts = await _unitOfWork.Repository<Product>().GetAllAsync();
        var queryable = allProducts.AsQueryable();

        // 2. Chức năng TÌM KIẾM THEO TÊN
        if (!string.IsNullOrEmpty(query.SearchTerm))
        {
            queryable = queryable.Where(p => p.Name.ToLower().Contains(query.SearchTerm.ToLower()));
        }

        // 3. Chức năng LỌC THEO DANH MỤC
        if (query.CategoryId.HasValue)
        {
            queryable = queryable.Where(p => p.CategoryId == query.CategoryId.Value);
        }

        // 4. Tính toán PHÂN TRANG
        int totalItems = queryable.Count();
        int totalPages = (int)Math.Ceiling(totalItems / (double)query.PageSize);

        // Dùng Skip và Take để cắt đúng số lượng sản phẩm của trang đó
        var pagedProducts = queryable
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToList();

        // 5. Map dữ liệu trả về DTO
        var items = pagedProducts.Select(p => new ProductResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            CategoryId = p.CategoryId,
            ImageUrl = p.ImageUrl
        });

        return new PagedResultDto<ProductResponseDto>
        {
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = items
        };
    }

    public async Task<ProductResponseDto?> GetByIdAsync(Guid id)
    {
        var productRepo = _unitOfWork.Repository<Product>();
        var product = await productRepo.GetByIdAsync(id);

        if (product == null) return null;

        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            CategoryId = product.CategoryId,
            CreatedAt = product.CreatedAt,
            ImageUrl = product.ImageUrl
        };
    }

    public async Task<ProductResponseDto> CreateAsync(ProductRequestDto request)
    {
        var productRepo = _unitOfWork.Repository<Product>();

        var newProduct = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            CategoryId = request.CategoryId
        };

        await productRepo.AddAsync(newProduct);
        await _unitOfWork.SaveChangesAsync();

        return new ProductResponseDto
        {
            Id = newProduct.Id,
            Name = newProduct.Name,
            Description = newProduct.Description,
            Price = newProduct.Price,
            Stock = newProduct.Stock,
            CategoryId = newProduct.CategoryId,
            CreatedAt = newProduct.CreatedAt
        };
    }

    public async Task UpdateAsync(Guid id, ProductRequestDto request)
    {
        var productRepo = _unitOfWork.Repository<Product>();
        var product = await productRepo.GetByIdAsync(id);

        if (product == null) throw new Exception("Không tìm thấy sản phẩm!");

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.CategoryId = request.CategoryId;

        productRepo.Update(product);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var productRepo = _unitOfWork.Repository<Product>();
        var product = await productRepo.GetByIdAsync(id);

        if (product == null) throw new Exception("Không tìm thấy sản phẩm!");

        // Soft delete: Chỉ đánh dấu là đã xóa chứ không xóa hẳn khỏi Database
        product.IsDeleted = true;

        productRepo.Update(product);
        await _unitOfWork.SaveChangesAsync();
    }
}
