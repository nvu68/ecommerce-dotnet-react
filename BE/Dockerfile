# 1. Mượn máy ảo .NET 9.0 để Build code (Sửa 8.0 thành 9.0)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy toàn bộ code Backend vào máy ảo
COPY . .

# Chui vào thư mục API để Build
WORKDIR /src/Ecommerce.API
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# 2. Tạo môi trường siêu nhẹ .NET 9.0 để chạy Web (Sửa 8.0 thành 9.0)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Báo cho Render biết web chạy ở cổng 8080
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Lệnh khởi động Backend
ENTRYPOINT ["dotnet", "Ecommerce.API.dll"]