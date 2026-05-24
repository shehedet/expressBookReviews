const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
let users = require('./user.js');

const JWT_SECRET = "access";

// Helper: check if username already exists
const isValid = (username) => {
  return users.some(u => u.username === username);
};

// Helper: check if username + password match
const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// POST /customer/login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check your credentials." });
  }

  // Sign JWT token
  const accessToken = jwt.sign({ data: username }, JWT_SECRET, { expiresIn: "1h" });

  // Save token and username in session
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: `User ${username} successfully logged in.`, token: accessToken });
});

// PUT /customer/auth/review/:isbn — Add or modify a review (logged-in users only)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required as a query parameter." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Add or overwrite the review by this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review for ISBN ${isbn} added/updated successfully.`,
    reviews: books[isbn].reviews
  });
});

// DELETE /customer/auth/review/:isbn — Delete own review (logged-in users only)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on this book." });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review by ${username} for ISBN ${isbn} deleted successfully.`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
