using FormulaOne.ChatService.Models;
using Microsoft.EntityFrameworkCore;

namespace FormulaOne.ChatService.DataService
{
    public class ChatAppDbContext : DbContext
    {
        public ChatAppDbContext(DbContextOptions<ChatAppDbContext> options)
            : base(options)
        {
        }

        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<ChatUser> ChatUsers => Set<ChatUser>();
    }
}
