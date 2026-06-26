# 🎬 CineMatch — AI-Powered Cinema Discovery & Booking

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logoColor=white)

> **"Film bulma işini AI'ye bırak."**

---

## The Problem

Cinema booking apps are transactional and dumb. They show a movie list, you scroll, you pick. But what you actually need is: *"Bu akşam arkadaşlarımla izleyebileceğim, çok karanlık olmayan, 2 saatten kısa bir film var mı?"*

No booking app answers that. They don't know your mood, your companions, your taste, or why you're going to the cinema tonight.

## The Solution

**CineMatch** is a full-stack cinema app with an embedded AI advisor. Before you book, you chat with an AI that understands your mood and context, recommends the right film with reasoning, and then guides you through real-time seat booking — all in one flow.

---

## AI Advisor in Action

```
User: "Bu akşam romantik ama çok melankolik olmayan, 
       2 saatten kısa bir film istiyorum."

CineMatch AI:
  Analyzing mood: romantic, light, not heavy
  Filtering: duration < 120min, genre: romance/comedy
  
  Recommendation: "Amelie" (18:30 seansı müsait)
  
  Why this film for you tonight:
  "Amelie, tam aradığın şeyi sunuyor — sıcak, eğlenceli, 
   ve sizi düşüncelere bırakmayan bir romantizm. 122 dakika.
   3 ön koltuk boş."

  → [Koltuk Seç] [Başka Öneri]
```

---

## Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Movie Advisor | Chat-based mood-to-movie recommendation via Ollama |
| 🗺️ Live Seat Map | SVG seat map, real-time availability via Socket.io |
| 🎫 QR Ticket | Unique QR code ticket generated after booking |
| 👤 User Profiles | Watch history, genre preferences, past bookings |
| 🔐 Auth | JWT + HTTP-only cookie, register/login |
| 🎛️ Admin Panel | Manage movies, halls, showtimes via dashboard |
| 🧠 Taste Learning | AI improves recommendations based on past ratings |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React Client                       │
│    AI Chat Advisor | Seat Map | Booking Flow         │
└────────────────────┬─────────────────────────────────┘
                     │  REST + WebSocket
┌────────────────────▼─────────────────────────────────┐
│              Express.js API Server                   │
│         JWT Auth Middleware | Route Guards            │
└────────┬─────────────────────────┬────────────────────┘
         │                         │                    │
┌────────▼──────┐    ┌─────────────▼──────┐  ┌─────────▼──────┐
│   MongoDB     │    │    Socket.io        │  │ Ollama (local) │
│ (Movies,      │    │ (Real-time seat     │  │ qwen2.5:7b     │
│  Bookings,    │    │  locking +          │  │ Recommendation │
│  Users)       │    │  availability)      │  │ engine         │
└───────────────┘    └────────────────────┘  └────────────────┘
```

## AI Recommendation Flow

```
User describes mood/preference
         │
         ▼
Ollama parses intent
  → extract: genre, duration, mood, companions
         │
         ▼
Filter movies from MongoDB
  → apply constraints (duration, genre, availability)
         │
         ▼
Ollama ranks + explains top 3 matches
  → returns: movie, showtime, reasoning in Turkish
         │
         ▼
User selects → Live seat map opens
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/recommend` | Send mood query → get AI recommendation |
| GET | `/api/movies` | List all movies |
| GET | `/api/movies/:id` | Movie detail + showtimes |
| GET | `/api/seats/:showtimeId` | Real-time seat map |
| POST | `/api/bookings` | Create booking + generate QR ticket |
| GET | `/api/bookings/me` | User booking history |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/admin/movies` | Admin: manage movies |

---

## Seat Map Design

The seat map is an SVG component where each seat is a clickable `<rect>` element:
- **Green**: Available
- **Red**: Booked (locked server-side)
- **Blue**: Your current selection
- **Gray**: Temporarily locked by another user (Socket.io broadcast, 3-minute hold)

When you click a seat, Socket.io broadcasts the hold to all clients in the same showtime room instantly.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + HTTP-only cookies |
| Real-time | Socket.io |
| AI | Ollama (qwen2.5:7b — local) |
| QR Code | `qrcode` npm package |
| Seat Map | SVG (custom React component) |

---

## Implementation Roadmap

### Phase 1 — Backend Foundation
- [ ] Project setup: Express + MongoDB + Mongoose
- [ ] Movie schema (title, description, genre, duration, poster, rating)
- [ ] Hall schema (rows, columns, seat layout)
- [ ] Showtime schema (movie ref, hall ref, date, time, price)
- [ ] Booking schema (user ref, showtime ref, seats, qr_code, status)
- [ ] Seed script with 10 movies and 3 halls

### Phase 2 — Auth + User Preferences
- [ ] Register / Login / Logout (JWT, HTTP-only cookie)
- [ ] User schema: includes `watchHistory`, `preferredGenres`, `ratings`
- [ ] Protected routes middleware
- [ ] User profile endpoint (bookings history, preferences)

### Phase 3 — Live Seat Map
- [ ] SVG seat map React component (rows × columns grid)
- [ ] Socket.io: join showtime room, broadcast seat holds, release on disconnect
- [ ] 3-minute seat hold timer (prevent ghost locks)
- [ ] Booking confirmation: update seat status in MongoDB + emit to all clients
- [ ] QR code generation on booking success (encode booking ID)

### Phase 4 — AI Movie Advisor
- [ ] Ollama integration (qwen2.5:7b)
- [ ] Mood → intent parsing prompt (few-shot, Turkish examples)
- [ ] MongoDB query builder from parsed constraints
- [ ] Top-3 recommendation ranking with reasoning
- [ ] Advisor chat UI component (collapsible, floating)
- [ ] Post-watch rating → store in user preferences for future recommendations

### Phase 5 — Admin Dashboard + Polish
- [ ] Admin role (middleware guard)
- [ ] Admin UI: add/edit/delete movies, halls, showtimes
- [ ] Dashboard analytics: most booked movies, seat utilization per hall
- [ ] Mobile-responsive seat map
- [ ] Email confirmation (Nodemailer) with QR ticket attachment

---

## Getting Started (once Phase 1 is complete)

```bash
# Prerequisites: Node.js 18+, MongoDB, Ollama
ollama pull qwen2.5:7b

git clone https://github.com/tursuntalha/cinema-ticket-system.git
cd cinema-ticket-system

# Backend
cd server && npm install
cp .env.example .env   # Add MONGO_URI, JWT_SECRET
npm start

# Frontend
cd ../client && npm install
npm run dev
```

---

> CineMatch turns "what should I watch tonight?" into a complete experience — from AI conversation to seat selection in under 2 minutes.
