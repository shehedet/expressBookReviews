const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid } = require('./auth_users.js');
let users = require('./user.js');

const public_users = express.Router();

// ─────────────────────────────────────────────────────────────
// Task 7: POST /register
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
// Task 2 (Task 11): GET / — Get all books using Promise
// ─────────────────────────────────────────────────────────────
public_users.get('/', function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject({ status: 500, message: "Unable to retrieve books." });
    }
  });

  getBooksPromise
    .then((allBooks) => {
      res.send(JSON.stringify(allBooks, null, 4));
    })
    .catch((err) => {
      res.status(err.status).json({ message: err.message });
    });
});

// ─────────────────────────────────────────────────────────────
// Task 3 (Task 11): GET /isbn/:isbn — Get book by ISBN using Promise
// ─────────────────────────────────────────────────────────────
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject({ status: 404, message: `No book found with ISBN: ${isbn}` });
    }
  });

  getBookByISBN
    .then((book) => {
      res.send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      res.status(err.status).json({ message: err.message });
    });
});

// ─────────────────────────────────────────────────────────────
// Task 4 (Task 11): GET /author/:author — Get books by author using async/await with Axios
// ─────────────────────────────────────────────────────────────
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get('http://localhost:5000/');
    const allBooks = response.data;

    const booksByAuthor = {};
    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].author.toLowerCase().includes(author.toLowerCase())) {
        booksByAuthor[isbn] = allBooks[isbn];
      }
    });

    if (Object.keys(booksByAuthor).length === 0) {
      return res.status(404).json({ message: `No books found by author: ${author}` });
    }

    res.send(JSON.stringify(booksByAuthor, null, 4));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// Task 5 (Task 11): GET /title/:title — Get books by title using async/await with Axios
// ─────────────────────────────────────────────────────────────
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get('http://localhost:5000/');
    const allBooks = response.data;

    const booksByTitle = {};
    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].title.toLowerCase().includes(title.toLowerCase())) {
        booksByTitle[isbn] = allBooks[isbn];
      }
    });

    if (Object.keys(booksByTitle).length === 0) {
      return res.status(404).json({ message: `No books found with title: ${title}` });
    }

    res.send(JSON.stringify(booksByTitle, null, 4));
  } catch (err) {
    res.status(500).json({ message: err.message });
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
