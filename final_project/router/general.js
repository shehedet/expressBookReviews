const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid } = require('./auth_users.js');
let users = require('./user.js');

const public_users = express.Router();

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
// Task 2: GET / — Get all books using async/await with Axios
// ─────────────────────────────────────────────────────────────
public_users.get('/', async (req, res) => {
  try {
    // Use Promise to asynchronously retrieve book list
    const getAllBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const allBooks = await getAllBooks;
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books." });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 3: GET /isbn/:isbn — Get book by ISBN using async/await with Axios
// ─────────────────────────────────────────────────────────────
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const getBookByISBN = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject({ status: 404, message: `No book found with ISBN: ${isbn}` });
      }
    });
    const book = await getBookByISBN;
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 4: GET /author/:author — Get books by author using async/await with Axios
// ─────────────────────────────────────────────────────────────
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    // Async function to filter books by author using axios
    const getBooksByAuthor = async (authorName) => {
      const bookList = await axios.get('http://localhost:5000/');
      const filteredBooks = {};
      const data = bookList.data;
      Object.keys(data).forEach((isbn) => {
        if (data[isbn].author.toLowerCase().includes(authorName.toLowerCase())) {
          filteredBooks[isbn] = data[isbn];
        }
      });
      return filteredBooks;
    };
    const result = await getBooksByAuthor(author);
    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: `No books found by author: ${author}` });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 5: GET /title/:title — Get books by title using async/await with Axios
// ─────────────────────────────────────────────────────────────
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    // Async function to filter books by title using axios
    const getBooksByTitle = async (bookTitle) => {
      const bookList = await axios.get('http://localhost:5000/');
      const filteredBooks = {};
      const data = bookList.data;
      Object.keys(data).forEach((isbn) => {
        if (data[isbn].title.toLowerCase().includes(bookTitle.toLowerCase())) {
          filteredBooks[isbn] = data[isbn];
        }
      });
      return filteredBooks;
    };
    const result = await getBooksByTitle(title);
    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: `No books found with title: ${title}` });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
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

module.exports.general = public_users;
