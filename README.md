# EventHub - Mini Event Platform

A full-stack MERN application for creating, viewing, and RSVPing to events.

## 🚀 Live Demo

- **Frontend**: [Your Vercel/Netlify URL]
- **Backend**: [Your Render/Railway URL]

## ✨ Features

### Core Features
- **User Authentication**: Secure signup/login with JWT tokens
- **Event Management**: Full CRUD operations for events
- **Image Upload**: Upload and display event images
- **RSVP System**: Join/leave events with capacity enforcement
- **Concurrency Handling**: Prevents overbooking with atomic database operations
- **Responsive Design**: Works on desktop, tablet, and mobile

### Bonus Features
- **Search & Filter**: Search events by title/description, filter by category
- **User Dashboard**: View created events and RSVPs
- **Category System**: Organize events by type

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Styling**: Custom CSS with CSS Variables

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventplatform
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 RSVP Concurrency Handling - Technical Explanation

### The Challenge
When multiple users try to RSVP for the last available spot simultaneously, we need to ensure:
1. Only one user gets the spot
2. No overbooking occurs
3. No duplicate RSVPs

### The Solution: MongoDB Atomic Operations

We use MongoDB's `findOneAndUpdate` with atomic operators to handle concurrent RSVPs safely.

```javascript
const updatedEvent = await Event.findOneAndUpdate(
  {
    _id: eventId,
    // Atomic capacity check: only match if array length < capacity
    $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] },
    // Ensure user not already in attendees
    attendees: { $ne: userId }
  },
  {
    // $addToSet prevents duplicates even if check somehow fails
    $addToSet: { attendees: userId }
  },
  { new: true }
);
```

### How It Works

1. **Single Atomic Operation**: The query condition and update happen in ONE atomic database operation
2. **Capacity Check in Query**: `$expr: { $lt: [{ $size: '$attendees' }, '$capacity'] }` checks capacity AS PART of the query
3. **Race Condition Prevention**: If two requests arrive simultaneously:
   - Both try to match the document
   - Only one succeeds because MongoDB locks the document during update
   - The second request finds no matching document (capacity now met)
4. **Duplicate Prevention**: `$addToSet` operator ensures a user can't be added twice

### Why This Works

- **Atomicity**: MongoDB guarantees that `findOneAndUpdate` is atomic
- **Query-Update Fusion**: The capacity check is part of the query, not a separate read
- **No Race Window**: There's no gap between checking capacity and adding the user

This approach is more efficient than using MongoDB transactions for this use case, as it accomplishes the goal with a single database operation.

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API services
│   │   └── hooks/          # Custom hooks
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & upload middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── uploads/            # Uploaded images
└── README.md
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (auth required)
- `PUT /api/events/:id` - Update event (owner only)
- `DELETE /api/events/:id` - Delete event (owner only)
- `GET /api/events/my-events` - Get user's created events
- `GET /api/events/my-rsvps` - Get user's RSVPs

### RSVP
- `POST /api/events/:id/rsvp` - Join event
- `DELETE /api/events/:id/rsvp` - Leave event

## 🚀 Deployment

### Backend (Render/Railway)
1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Frontend (Vercel/Netlify)
1. Import project from GitHub
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add `VITE_API_URL` environment variable pointing to your backend

## 👤 Author

[Your Name]

## 📄 License

MIT

