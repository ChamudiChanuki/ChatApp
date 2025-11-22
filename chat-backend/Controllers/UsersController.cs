using System.Linq;
using System.Threading.Tasks;
using FormulaOne.ChatService.DataService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FormulaOne.ChatService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // must be logged in (JWT)
    public class UsersController : ControllerBase
    {
        private readonly ChatAppDbContext _dbContext;

        public UsersController(ChatAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Returns all usernames except the currently logged-in user.
        /// GET: api/users
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            // Set in AuthController -> GenerateJwtToken: ClaimTypes.Name = user.Username
            var currentUsername = User.Identity?.Name;

            var allUsernames = await _dbContext.ChatUsers
                .Select(u => u.Username)
                .ToListAsync();

            var contacts = allUsernames
                .Where(u => u != currentUsername)
                .ToList();

            return Ok(contacts);
        }

        /// <summary>
        /// Returns information about the current logged-in user.
        /// GET: api/users/me
        /// </summary>
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            if (User.Identity?.IsAuthenticated != true)
                return Unauthorized();

            var username = User.Identity?.Name;

            return Ok(new { username });
        }
    }
}
