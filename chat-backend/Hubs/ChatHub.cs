using System.Threading.Tasks;
using FormulaOne.ChatService.DataService;
using FormulaOne.ChatService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FormulaOne.ChatService.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly SharedDb _sharedDb;
        private readonly ChatAppDbContext _dbContext;

        public ChatHub(SharedDb sharedDb, ChatAppDbContext dbContext)
        {
            _sharedDb = sharedDb;
            _dbContext = dbContext;
        }

        
        public async Task JoinChat(UserConnection conn)
        {
            await Clients.All.SendAsync("ReceiveMessage", "admin",
                $"{conn.Username} has joined {conn.ChatRoom}");
        }

        public async Task JoinSpecificRoom(UserConnection conn)
        {
            
            var username = Context.User?.Identity?.Name ?? conn.Username;
            conn.Username = username;

            
            await Groups.AddToGroupAsync(Context.ConnectionId, conn.ChatRoom);
            _sharedDb.connections[Context.ConnectionId] = conn;

            
            await Task.CompletedTask;
        }

        public async Task SendMessage(string message)
        {
            if (_sharedDb.connections.TryGetValue(Context.ConnectionId, out var conn) && conn is not null)
            {
                var chatMessage = new ChatMessage
                {
                    Room = conn.ChatRoom,
                    Sender = conn.Username,
                    Content = message,
                    SentAt = DateTime.UtcNow
                };

                _dbContext.ChatMessages.Add(chatMessage);
                await _dbContext.SaveChangesAsync();

                await Clients.Group(conn.ChatRoom)
                    .SendAsync("ReceiveMessage", conn.Username, message);
            }
        }
    }
}
