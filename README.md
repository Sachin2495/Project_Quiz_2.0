# Bug Bash - Debugging Challenge Platform

A web-based platform for hosting debugging challenges across multiple programming languages.

## Features
- Multi-language support
- Real-time code execution
- Three challenging rounds
- Live leaderboard
- Admin panel
- Built-in Monaco code editor

## Setup Instructions

1. Install dependencies:
```bash
npm run install-all
```

2. Create a `.env` file in the backend directory with:
```
JUDGE0_API_KEY=your_judge0_api_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. Start the application:
```bash
npm start
```

The frontend will run on http://localhost:3000 and the backend on http://localhost:5000.

## Technology Stack
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB
- Code Execution: Judge0 API
=======
