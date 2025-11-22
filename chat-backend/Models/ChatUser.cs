namespace FormulaOne.ChatService.Models
{
    public class ChatUser
    {
        public int Id { get; set; }

        public string Username { get; set; } = string.Empty;

        // Store hashed password + salt, NEVER plain text
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
