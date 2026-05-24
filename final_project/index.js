const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// ── Session middleware (only for /customer routes) ────────────────────────────
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }   // set true in production with HTTPS
  })
);

// ── JWT Authentication Middleware (protects /customer/auth/* routes) ──────────
app.use("/customer/auth/*", function auth(req, res, next) {
  const authorization = req.session?.authorization;

  if (!authorization || !authorization.accessToken) {
    return res.status(403).json({ message: "User not logged in. Please log in first." });
  }

  try {
    const decoded = jwt.verify(authorization.accessToken, "access");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token. Please log in again." });
  }
});

// ── Mount routers ─────────────────────────────────────────────────────────────
app.use("/customer", customer_routes);   // /customer/login, /customer/auth/review/:isbn
app.use("/", genl_routes);               // /, /isbn/:isbn, /author/:author, /title/:title, /review/:isbn

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`📚 Book Review Server running on http://localhost:${PORT}`);
  console.log("Routes:");
  console.log("  GET  /                          → All books");
  console.log("  GET  /isbn/:isbn                → Book by ISBN");
  console.log("  GET  /author/:author            → Books by author");
  console.log("  GET  /title/:title              → Books by title");
  console.log("  GET  /review/:isbn              → Reviews for a book");
  console.log("  POST /register                  → Register new user");
  console.log("  POST /customer/login            → Login");
  console.log("  PUT  /customer/auth/review/:isbn → Add/Edit review (auth)");
  console.log("  DELETE /customer/auth/review/:isbn → Delete review (auth)");
  console.log("  GET  /async/books               → All books via Axios");
  console.log("  GET  /async/isbn/:isbn          → Book by ISBN via Axios");
  console.log("  GET  /async/author/:author      → Books by author via Axios");
  console.log("  GET  /async/title/:title        → Books by title via Axios");
});
