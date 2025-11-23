using FormulaOne.ChatService.DataService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FormulaOne.ChatService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly ChatAppDbContext _dbContext;

        public MessagesController(ChatAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        
        [HttpGet("{room}")]
        public async Task<IActionResult> GetRecentMessages(string room, [FromQuery] int count = 50)
        {
            var messages = await _dbContext.ChatMessages
                .Where(m => m.Room == room)
                .OrderByDescending(m => m.SentAt)
                .Take(count)
                .OrderBy(m => m.SentAt) 
                .ToListAsync();

            
            var result = messages.Select(m => new
            {
                m.Sender,
                m.Content,
                m.SentAt
            });

            return Ok(result);
        }
    }
}
