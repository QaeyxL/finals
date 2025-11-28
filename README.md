# Journal Explorer - Finals Project

Full-stack MERN (MongoDB, Express, React, Node.js) journal application with user authentication and CRUD operations.

## 📋 Project Overview

This project demonstrates:
- User authentication (signup/login)
- CRUD operations for journal entries
- MongoDB database integration
- Frontend-backend communication
- Debugging process with console.log statements
- Three intentional bugs and their fixes

---

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **dotenv** for environment variables
- **express-validator** for input validation
- Nominatim API for geocoding

### Frontend
- **React** with Hooks (useState, useEffect, useContext)
- **React Router** for navigation
- Custom hooks (useForm, useHttpClient)
- Context API for authentication

---

## 📁 Project Structure

```
Hilario_finals/
├── backend/
│   ├── controllers/
│   │   ├── journal-controllers.js    # Journal CRUD operations
│   │   └── users-controllers.js       # User auth & management
│   ├── models/
│   │   ├── journal.js                 # Journal schema
│   │   ├── user.js                    # User schema
│   │   └── http-error.js              # Custom error class
│   ├── routes/
│   │   ├── journal-routes.js          # Journal API routes
│   │   └── users-routes.js            # User API routes
│   ├── util/
│   │   └── geocode.js                 # Location to coordinates
│   ├── .env                           # Environment variables (not in repo)
│   ├── app.js                         # Express server setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── journals/
│   │   │   ├── components/           # Entry list & items
│   │   │   └── pages/                # New/Update/View entries
│   │   ├── user/
│   │   │   ├── components/           # User list & items
│   │   │   └── pages/                # Auth & Users pages
│   │   └── shared/
│   │       ├── components/           # Reusable UI components
│   │       ├── context/              # Auth context
│   │       ├── hooks/                # Custom hooks
│   │       └── util/                 # Validators
│   └── package.json
│
└── Documentation/
    ├── BUG_C_ERROR_AND_SOLUTION.md
    ├── BUGS_FIXED_SUMMARY.md
    └── TEST_DATA_FOR_BUGS.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Hilario_finals
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
DB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appname>
NOMINATIM_BASE=https://nominatim.openstreetmap.org
GEOCODER_USER_AGENT=journal-explorer
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
node app.js
```
Backend runs on: `http://localhost:5005`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on: `http://localhost:3000`

---

## 👤 User Schema Update

Updated user model to include richer identity fields:

```javascript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}
```

**Signup form includes:**
- First Name
- Last Name
- Mobile Number
- Email
- Password

---

## 🐛 Three Bugs & Fixes

### Bug A - "The Infinite Spinner" (Frontend State Logic)
**File:** `frontend/src/journals/pages/UpdateEntry.js`

**Issue:** After updating an entry, spinner keeps spinning and page doesn't navigate.

**Fix:** Added `navigate()` call after successful update:
```javascript
navigate("/" + auth.userId + "/journal");
```

---

### Bug B - "The Identity Crisis" (Backend Login Logic)
**File:** `backend/controllers/users-controllers.js`

**Issue:** Signup works but login fails with "User not found".

**Fix:** Ensured login query uses correct field:
```javascript
existingUser = await User.findOne({ email: req.body.email });
```

---

### Bug C - "The Phantom List" (Database Retrieval)
**File:** `backend/controllers/journal-controllers.js`

**Issue:** Entries save successfully but list is always empty.

**Fix:** Query uses correct field name matching schema:
```javascript
entries = await Journal.find({ author: userId });
```

**Fix:** Returns actual query results, not hardcoded empty array:
```javascript
res.json({
  entries: entries.map((entry) => entry.toObject({ getters: true }))
});
```

---

## 🔍 Debugging Process

### Console.log Statements Added

**Backend - users-controllers.js:**
- 11 numbered logs in signup function
- Login attempt tracking with email and query results
- User creation and database save verification

**Backend - journal-controllers.js:**
- 12 logs in getEntriesByUserId tracking query execution
- Database result logging with entry count
- Field matching verification

**Frontend - Auth.js:**
- Request/response logging for signup and login
- Auth context update tracking
- Error logging

**Frontend - UpdateEntry.js:**
- Update payload logging
- Response tracking
- Navigation confirmation

### Chrome DevTools Usage
- **Network Tab:** Monitor API requests/responses
- **Console Tab:** View frontend logs
- Backend terminal for server-side logs

---

## 📊 API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - Login user

### Journals
- `GET /api/journal/:pid` - Get entry by ID
- `GET /api/journal/user/:uid` - Get all entries for user
- `POST /api/journal` - Create new entry
- `PATCH /api/journal/:pid` - Update entry
- `DELETE /api/journal/:pid` - Delete entry

---

## 🧪 Testing

### Test Bug A:
1. Login
2. Create entry
3. Edit entry
4. Click UPDATE ENTRY
5. **Expected:** Navigates to journal list

### Test Bug B:
1. Signup with test@test.com
2. Logout/refresh
3. Login with same credentials
4. **Expected:** Login succeeds

### Test Bug C:
1. Login
2. Create 2 entries
3. Click MY ENTRIES
4. **Expected:** Both entries appear

---

## 📄 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- OpenStreetMap Nominatim for geocoding API
- React documentation and community
