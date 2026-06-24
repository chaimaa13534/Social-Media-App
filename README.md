# 🌐 SocialNet

A **modern, full-stack social network** built with Node.js, Express, MySQL and Vanilla JS.  
Clean MVC architecture · JWT auth · Socket.io real-time · Infinite scroll · Dark/light mode.

---

## ✨ Features

| Category | Details |
|---|---|
| **Auth** | Register, login, JWT, bcrypt password hashing |
| **Feed** | Paginated infinite-scroll feed, For You / Following tabs |
| **Posts** | Create (with image), edit, delete |
| **Likes** | Toggle like/unlike, live counter |
| **Comments** | Add, edit, delete — inline under each post |
| **Profiles** | Avatar, banner, bio, follow/unfollow |
| **Follow system** | Follow / unfollow, followers & following lists |
| **Notifications** | Real-time badge, dropdown, notifications page |
| **Search** | Live search bar (people + posts), Explore page |
| **Dashboard** | Site-wide stats, top users leaderboard |
| **Trending** | Hot posts in the last 24 h |
| **Suggestions** | "Who to follow" recommendations |
| **Dark mode** | Persisted theme toggle |
| **Responsive** | Mobile-first, sidebar hidden on small screens |

---

## 🛠 Tech Stack

```
Backend   : Node.js · Express.js · Socket.io
Database  : MySQL (mysql2/promise, connection pool)
Auth      : JWT (jsonwebtoken) · bcryptjs
Security  : Helmet · CORS · express-rate-limit · Morgan
Upload    : Multer (local disk, UUID filenames)
Frontend  : Vanilla JS (ES6 modules pattern) · CSS3 variables · Font Awesome 6
```

---

## 🚀 Quick Start

### 1 — Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8

### 2 — Clone & install

```bash
git clone https://github.com/yourname/socialnet.git
cd socialnet
npm install
```

### 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=socialnet

JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=5242880
```

### 4 — Create the database

```bash
# Create placeholder images
node database/create-placeholders.js

# Run the SQL schema
npm run db:init
```

> Or manually: `mysql -u root -p < database/schema.sql`

### 5 — Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Open **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
socialnet/
├── server/
│   ├── config/
│   │   └── db.js                  # MySQL pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   ├── likeController.js
│   │   ├── followController.js
│   │   ├── searchController.js
│   │   ├── dashboardController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT guard
│   │   ├── upload.js              # Multer
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Like.js
│   │   ├── Follower.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── index.js               # Master router
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   └── comments.js
│   └── app.js                     # Express + Socket.io entry
│
├── client/
│   ├── assets/uploads/            # Uploaded images
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── modules/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── utils.js
│   │   │   ├── posts.js
│   │   │   ├── comments.js
│   │   │   ├── profile.js
│   │   │   ├── search.js
│   │   │   ├── notifications.js
│   │   │   └── socket.js
│   │   └── app.js                 # Router + boot
│   └── index.html
│
├── database/
│   ├── schema.sql
│   ├── init.js
│   └── create-placeholders.js
│
├── .env.example
├── package.json
└── README.md
```

---

## 🔌 REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login`    | ❌ | Login, get JWT |
| GET  | `/api/auth/me`       | ✅ | Get current user |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/api/users`              | ✅ | List all users |
| GET  | `/api/users/suggestions`  | ✅ | Who to follow |
| GET  | `/api/users/:id`          | ✅ | Get profile |
| PUT  | `/api/users/:id`          | ✅ | Update profile |
| GET  | `/api/users/:id/followers`| ✅ | Follower list |
| GET  | `/api/users/:id/following`| ✅ | Following list |

### Posts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET    | `/api/posts`              | ✅ | Feed (paginated) |
| GET    | `/api/posts/trending`     | ✅ | Top posts 24h |
| GET    | `/api/posts/user/:userId` | ✅ | User's posts |
| POST   | `/api/posts`              | ✅ | Create post |
| PUT    | `/api/posts/:id`          | ✅ | Edit post |
| DELETE | `/api/posts/:id`          | ✅ | Delete post |

### Comments · Likes · Follow · Search · Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/comments/:postId`       | Comments for a post |
| POST   | `/api/comments`               | Add comment |
| PUT    | `/api/comments/:id`           | Edit comment |
| DELETE | `/api/comments/:id`           | Delete comment |
| POST   | `/api/likes`                  | Toggle like |
| POST   | `/api/follow`                 | Toggle follow |
| GET    | `/api/search?q=`              | Search users & posts |
| GET    | `/api/dashboard/stats`        | Site stats |
| GET    | `/api/notifications`          | My notifications |
| PUT    | `/api/notifications/mark-read`| Mark all read |

---

## 🌍 Deployment (basic)

```bash
# Set NODE_ENV and JWT_SECRET properly in .env
NODE_ENV=production

# Use PM2
npm install -g pm2
pm2 start server/app.js --name socialnet
pm2 save
```

For a production setup, put Nginx in front as a reverse proxy and serve `client/` as static files.

---

## 📝 License

MIT — free to use, modify, and build on.
