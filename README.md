# Logistics Management System (a.k.a. “ship it, literally”)

This repo is a do-it-all logistics sandbox: a Next.js 15 frontend, a TypeScript Express backend, some MongoDB magic, and three different dashboards yelling for attention (Admin, Customer, Driver). It’s not trying to win enterprise buzzword bingo—just help you track boxes from point A to point B.

![Next.js Login Interface](https://github.com/user-attachments/assets/e6ad08c4-34fd-48c7-9d41-3b89ba7192c6)

## 👀 What’s inside?

```
logistics-management-system/
├── client/                  # Next.js + Tailwind UI, lives on :3000
│   ├── src/app/             # App Router pages (login, dashboard, etc.)
│   ├── src/components/      # Reusable bits (dashboards, modals, inputs)
│   ├── src/contexts/        # Auth context & provider
│   ├── src/lib/             # API helpers, form utils, password helpers
│   └── src/types/           # Shared TypeScript types
├── server/                  # Express API, runs on :5000
│   ├── src/controllers/     # Auth, users, deliveries
│   ├── src/middleware/      # Auth guard, request validation, errors
│   ├── src/models/          # Mongoose schemas
│   ├── src/routes/          # API route definitions
│   └── src/tests/           # Jest + Supertest unit/integration suite
└── README.md                # You’re reading it 👋
```

## 🧰 Stuff you’ll need first

- Node.js 18+ (nvm makes life easier)
- pnpm 8+ (because both apps share a lockfile)
- MongoDB 5+ (local install or Docker, doesn’t matter)
- Two terminals, or a tmux tab if you’re fancy

## 🚀 Kickoff in 5-ish steps

```bash
# 1) grab the code
git clone <your-fork-or-https-url>
cd logistics-management-system

# 2) install backend things
cd server
pnpm install
cp .env.example .env    # then plug in Mongo URI + JWT secret

# 3) install frontend things
cd ../client
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# 4) fire up both servers (separate terminals)
cd ../server && pnpm run dev      # API on http://localhost:5000
cd ../client && pnpm run dev      # Web app on http://localhost:3000

# 5) log in, click around, deliver fake packages
```

Mongo tip: if you’d rather Docker it, `docker run -d -p 27017:27017 --name mongodb mongo:7` works just fine.

## 🗺️ Dashboards at a glance

| Role | What they can mess with |
|------|-------------------------|
| **Admin** | See every user, create new ones, assign deliveries, babysit stats |
| **Customer** | Book a delivery, check status, peek at history, leave notes |
| **Driver** | See assigned jobs, flip statuses (Pending → In Transit → Delivered), grab addresses |

Shared perks: real JWT auth, server-side validation, and a tracking page you can share without logging in.

## 🧠 Under the hood

| Area | Tech | Why it’s here |
|------|------|---------------|
| Frontend | Next.js 15, TypeScript, Tailwind, React Context, Solar icons | App Router goodies with type safety and quick styling |
| Backend | Express, TypeScript, Mongoose, express-validator, bcryptjs, JWT | Cozy REST API with typed models and sane auth |
| Testing | Jest, Supertest, mongodb-memory-server | Unit + integration tests without touching your real DB |

Want to run the API tests? `cd server && pnpm test`. Client tests live in `client` with `pnpm test`, too.

## 🔌 API cheat-sheet

```
POST   /api/auth/register            # make anyone (admin/customer/driver)
POST   /api/auth/login               # returns JWT + httpOnly cookie
GET    /api/auth/me                  # profile info for whoever is logged in

GET    /api/users                    # admin only, lists everyone
GET    /api/users/drivers            # admin filtered list of drivers
PUT    /api/users/:id                # admin updates user info
DELETE /api/users/:id                # admin soft-deletes (deactivates)

POST   /api/deliveries               # customer books a delivery
GET    /api/deliveries               # role-aware feed (admin sees all)
PUT    /api/deliveries/:id/assign    # admin assigns a driver
PUT    /api/deliveries/:id/status    # driver toggles status
GET    /api/deliveries/track/:code   # public tracking lookup
```

Use the password-protected ones with the cookie from `/api/auth/login` (the tests show how if you need a hint).

## 🧪 Fake accounts & test data

Spin up a few seed users manually or just register fresh ones. If you need a baseline idea, here’s what we usually create:

- **Admin** — `admin@logistics.com` / `Admin123`
- **Customer** — `customer@example.com` / `Customer123`
- **Driver** — `driver@example.com` / `Driver123`

The password strength helper nags you to keep things semi-secure, so toss in capitals + numbers.

## 🧯 Common “uh oh” moments

- **App can’t reach Mongo** → Double-check the URI in `server/.env`, especially if you renamed the Docker container.
- **Frontend says 500** → The backend probably isn’t running or your API URL changed. Update `NEXT_PUBLIC_API_URL` and restart `pnpm run dev`.
- **Tests hang** → Make sure you stopped the dev server; the in-memory Mongo server grabs its own port when tests run.
- **JWT expired?** → They only last a short while. Login again or tweak `JWT_EXPIRES_IN` in the `.env`.

## 🤝 Wanna hack on it?

1. Fork → clone → branch (`git checkout -b feature/cool-idea`).
2. Make your tweaks. Extra brownie points for tests in `server/src/tests` or `client/__tests__`.
3. `pnpm test` in whatever package you touched.
4. Commit + push + open a PR. Toss a gif in the description if you feel spicy.

## 📜 License

ISC license because we’re chill like that. Use it, remix it, just don’t blame us if your delivery truck gets lost.

---

Have questions, ideas, or found a bug? Drop an issue and we’ll nerd out about it together.