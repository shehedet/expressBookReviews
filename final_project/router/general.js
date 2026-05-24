const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid } = require('./auth_users.js');
let users = require('./user.js');

const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// ─────────────────────────────────────────────────────────────
// Task 7: POST /register — Register a new user
// ─────────────────────────────────────────────────────────────
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: `User '${username}' already exists.` });
  }

  users.push({ username, password });
  return res.status(201).json({ message: `User '${username}' registered successfully. You can now log in.` });
});

// ─────────────────────────────────────────────────────────────
// Task 2: GET / — Get all books (with async/await + Axios)
// ─────────────────────────────────────────────────────────────
public_users.get('/', async (req, res) => {
  try {
    // Async function using a local Promise to simulate async retrieval
    const getAllBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books.", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 3: GET /isbn/:isbn — Get book by ISBN (async/await)
// ─────────────────────────────────────────────────────────────
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const getBookByISBN = (isbn) =>
      new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject(new Error(`No book found with ISBN: ${isbn}`));
      });

    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 4: GET /author/:author — Get books by author (async/await)
// ─────────────────────────────────────────────────────────────
public_users.get('/author/:author', async (req, res) => {
  const authorQuery = req.params.author.toLowerCase();

  try {
    const getBooksByAuthor = (author) =>
      new Promise((resolve, reject) => {
        const matched = {};
        Object.keys(books).forEach((isbn) => {
          if (books[isbn].author.toLowerCase().includes(author)) {
            matched[isbn] = books[isbn];
          }
        });
        if (Object.keys(matched).length > 0) resolve(matched);
        else reject(new Error(`No books found by author: ${authorQuery}`));
      });

    const result = await getBooksByAuthor(authorQuery);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 5: GET /title/:title — Get books by title (async/await)
// ─────────────────────────────────────────────────────────────
public_users.get('/title/:title', async (req, res) => {
  const titleQuery = req.params.title.toLowerCase();

  try {
    const getBooksByTitle = (title) =>
      new Promise((resolve, reject) => {
        const matched = {};
        Object.keys(books).forEach((isbn) => {
          if (books[isbn].title.toLowerCase().includes(title)) {
            matched[isbn] = books[isbn];
          }
        });
        if (Object.keys(matched).length > 0) resolve(matched);
        else reject(new Error(`No books found with title: ${titleQuery}`));
      });

    const result = await getBooksByTitle(titleQuery);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 6: GET /review/:isbn — Get book review by ISBN
// ─────────────────────────────────────────────────────────────
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: `No book found with ISBN: ${isbn}` });
  }

  return res.status(200).json({ isbn, reviews: book.reviews });
});

// ─────────────────────────────────────────────────────────────
// Task 11 — Async/Await versions using Axios (external calls)
// These routes demonstrate Axios-based async retrieval.
// Prefix: /async
// ─────────────────────────────────────────────────────────────

// GET /async/books — Get all books via Axios async/await
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json({ source: "axios-async", books: response.data });
  } catch (err) {
    return res.status(500).json({ message: "Axios error.", error: err.message });
  }
});

// GET /async/isbn/:isbn — Get book by ISBN via Axios async/await
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return res.status(200).json({ source: "axios-async", book: response.data });
  } catch (err) {
    return res.status(404).json({ message: err.response?.data?.message || err.message });
  }
});

// GET /async/author/:author — Get books by author via Axios async/await
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).json({ source: "axios-async", books: response.data });
  } catch (err) {
    return res.status(404).json({ message: err.response?.data?.message || err.message });
  }
});

// GET /async/title/:title — Get books by title via Axios async/await
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return res.status(200).json({ source: "axios-async", books: response.data });
  } catch (err) {
    return res.status(404).json({ message: err.response?.data?.message || err.message });
  }
});

module.exports.general = public_users;
