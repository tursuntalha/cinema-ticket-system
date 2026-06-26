# Cinema Ticket Booking System

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

A full-stack cinema seat booking web application with real-time seat availability, user authentication, and QR code ticket generation. Built on the MERN stack with Socket.io for live updates.

---

## System Architecture

```
┌────────────────────────────────────────────────────┐
│                   React Client                     │
│        (Movie Browser / Seat Map / Tickets)        │
└────────────────────┬───────────────────────────────┘
                     │  REST API + WebSocket
┌────────────────────▼───────────────────────────────┐
│              Express.js API Server                 │
│         JWT Middleware / Route Guards               │
└───────┬──────────────────────────┬─────────────────┘
        │                          │
┌───────▼──────┐        ┌──────────▼──────────┐
│   MongoDB    │        │     Socket.io        │
│  (Database)  │        │  (Real-time seats)   │
└──────────────┘        └─────────────────────┘
```

---

## Planned Features

- Browse movies with posters, descriptions, genres, and ratings
- View showtimes by movie and date
- **Interactive seat map** — visual hall layout with live seat states (available / booked / selected)
- User authentication (register / login / JWT stored in HTTP-only cookie)
- Complete booking flow with seat selection confirmation
- **QR code ticket generation** — downloadable ticket after booking
- Admin dashboard — manage movies, cinema halls, and showtimes
- Real-time seat locking via Socket.io (prevents double-booking)

---

## API Endpoints (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | List all movies |
| GET | `/api/movies/:id` | Movie detail |
| GET | `/api/showtimes?movieId=&date=` | Available showtimes |
| GET | `/api/seats/:showtimeId` | Seat map for showtime |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/me` | User's booking history |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router, CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, HTTP-only cookies |
| Real-time | Socket.io |
| QR Code | `qrcode` npm package |
| Deploy | Docker + Render / Railway |

---

## Roadmap

| Phase | Task | Status |
|-------|------|--------|
| Phase 1 | Project setup (MERN boilerplate, JWT auth) | [ ] |
| Phase 2 | Movie and showtime CRUD API | [ ] |
| Phase 3 | Interactive seat map component (React) | [ ] |
| Phase 4 | Real-time seat locking via Socket.io | [ ] |
| Phase 5 | Booking flow + QR code ticket generation | [ ] |
| Phase 6 | Admin dashboard (manage movies/halls/times) | [ ] |
| Phase 7 | UI polish + responsive design | [ ] |
| Phase 8 | Docker deployment | [ ] |

---

## Getting Started (planned)

```bash
git clone https://github.com/tursuntalha/cinema-ticket-system.git
cd cinema-ticket-system

# Backend
cd server && npm install
cp .env.example .env   # Add MONGO_URI, JWT_SECRET
npm start

# Frontend (in another terminal)
cd ../client && npm install
npm run dev
```
