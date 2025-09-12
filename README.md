# Unimegle

A video chat platform for students with verified college email IDs, similar to Omegle but tailored for educational institutions.

## Features

- **College Email Verification**: Users must sign up with verified college email addresses (.edu/.ac domains)
- **Random Video Pairing**: Students are randomly connected for live video chat sessions
- **WebRTC Video Streaming**: Secure peer-to-peer video connections
- **Real-time Signaling**: Socket.IO for matchmaking and connection management
- **Responsive UI**: Clean interface optimized for desktop and mobile
- **Reporting System**: Users can report inappropriate behavior
- **Guest Mode**: Development mode for testing without authentication

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Video**: WebRTC
- **Real-time**: Socket.IO
- **Authentication**: JWT

## Quick Start

### Prerequisites

- Node.js (v16+)
- MySQL
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd uniMegle
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Database Setup**
   - Start MySQL
   - Create database: `CREATE DATABASE unimegle;`
   - Import schema: `mysql -u root -p unimegle < sql/schema.sql`
   - Update `server/.env` with your MySQL credentials:
     ```
     MYSQL_URL=mysql://username:password@localhost:3306/unimegle
     JWT_SECRET=your-secret-key
     ```

4. **Frontend Setup**
   ```bash
   cd ../my-web
   npm install
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd my-web
   npm run dev
   ```

6. **Access the app**
   - Frontend: http://localhost:5174
   - Backend: http://localhost:4000

## Usage

### Guest Mode (Development)
- Open two browser windows
- Click "Next" in both to connect
- Video chat will start automatically

### With Authentication
1. Sign up with a college email (.edu/.ac)
2. Verify your email (check MySQL for verification token)
3. Login and start video chatting

## Project Structure

```
uniMegle/
├── server/                 # Backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Socket.IO signaling
│   │   ├── middleware/    # Auth middleware
│   │   └── lib/          # Database utilities
│   └── sql/              # Database schema
├── my-web/               # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   └── api.js       # API client
└── README.md
```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification
- `GET /api/auth/session` - Check auth status
- `POST /api/report` - Report user

## Socket.IO Events

- `enqueue` - Join matchmaking queue
- `matched` - Peer connection established
- `signal` - WebRTC signaling data
- `leave` - Leave current session

## Development

### Environment Variables

**Backend (.env)**
```
PORT=4000
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
MYSQL_URL=mysql://username:password@localhost:3306/unimegle
JWT_SECRET=your-secret-key
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=dev
SMTP_PASS=dev
ALLOW_GUESTS=true
```

### Database Schema

The application uses MySQL with the following tables:
- `users` - User accounts and verification status
- `email_verifications` - Email verification tokens
- `reports` - User reports and moderation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Security Notes

- Always use HTTPS in production
- Set strong JWT secrets
- Configure proper CORS origins
- Implement rate limiting
- Use environment variables for sensitive data
