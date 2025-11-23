Real-Time Chat Application

This repository contains a small full-stack chat system.

The solution includes:

- Backend: .NET 8 Web API with SignalR and JWT authentication (deployed on Azure)
- Frontend: Next.js client that connects via SignalR and REST APIs (deployed on Netlify)
- Database: SQL Server, accessed via Entity Framework Core

Users can register, log in, see a list of other users, and start one-to-one real-time conversations with message history.

 1. Live URLs

- Frontend (Netlify):  
  https://illustrious-banoffee-3f7ae1.netlify.app

- Backend (Azure):
  https://chatapp-backend-dqbjhcbdcdggf2dn.centralindia-01.azurewebsites.net/swagger/index.html
 
 2. Technologies Used

  Backend

- .NET 8 (ASP.NET Core Web API)
- SignalR for real-time communication
- Entity Framework Core 8 (Code-First)
- SQL Server as the database
- JWT Bearer Authentication for login + securing SignalR

  Frontend

- Next.js (App Router)

- @microsoft/signalr
- CSS

  DevOps / Hosting

- Azure App Service for backend deployment
- Netlify for frontend deployment

3. Assumptions & Limitations

- Authentication
  Only basic username/password login is implemented.
  No password complexity checks, password reset, or email verification.
  JWT tokens are short-lived; there is no refresh-token flow.

- Users & Profiles
  Users are identified only by username .
  .
- Messaging
  Conversations are one-to-one only; no group chats.
  Messages are plain text .

- Error Handling & Validation
  Basic validation is present.
  API error responses are simple and not localized.

4. Possible Future Improvements

-Add user profiles (avatar, display name, status).

-Implement group chats and chat rooms.

-Improve design for mobile devices with a more refined layout and animations
