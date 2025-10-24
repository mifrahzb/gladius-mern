# Admin Manual - Gladius MERN

## Setup
1. Start backend:
   - copy backend/.env.example to backend/.env and fill values (MongoDB Atlas URI, JWT_SECRET, Cloudinary, Stripe, Email).
   - run: npm install && npm run dev

2. Start frontend:
   - go to frontend, copy .env.example to .env and set VITE_API_URL=http://localhost:5000/api
   - run: npm install && npm run dev

## Creating Admin
- Register a new user via the frontend /register route.
- In MongoDB Atlas, update that user's role to 'admin':
  ```
  db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
  ```

## Using Admin Panel
- Admin routes expected under frontend /admin. Use token-based auth (Authorization: Bearer <token>).
- Create products via POST /api/products (admin).
- For images: upload to Cloudinary, include images array with url and public_id in product payload.

## Adding Products Directly (MongoDB)
- If you prefer to add products directly in Atlas, ensure documents match Product schema.
- Minimal example:
  {
    name: "Chef Knife",
    slug: "chef-knife",
    description: "High quality chef knife",
    price: 5999,
    stock: 20,
    category: ObjectId("..."),
    images: [{ url: "https://res.cloudinary.com/...", public_id: "..." }]
  }

