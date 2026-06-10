using Ecommerce.API.Hubs;
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Ecommerce.API.Services;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(string message)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveOrderNotification", message);
    }
}