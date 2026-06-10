using Microsoft.AspNetCore.SignalR;

namespace Ecommerce.API.Hubs;

// Kế thừa class Hub của thư viện SignalR có sẵn trong .NET
public class NotificationHub : Hub
{
    // Tạm thời để trống, vì Server sẽ chủ động đẩy thông báo chứ Client không cần gọi lên đây
}