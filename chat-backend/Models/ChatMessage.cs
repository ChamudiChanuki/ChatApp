namespace FormulaOne.ChatService.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }

        public string Room { get; set; } = string.Empty;
        public string Sender { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
