require('dotenv').config(); // Load environment variables
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing

const app = express();
const db = new sqlite3.Database(process.env.DB_PATH || './users.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Middleware
app.use(cors({ origin: 'http://127.0.0.1:5502' })); // Restrict CORS to specific origin
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).send('Server is running');
});

// Create table if it doesn't exist
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )`,
        (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table ensured.');
            }
        }
    );
});

// Register Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(query, [username, email, hashedPassword], function (err) {
            if (err) {
                console.error('Error saving user data:', err.message);
                return res.status(500).send({ message: 'Error saving user data.' });
            }
            // Redirect to login.html after successful registration
            res.redirect('http://127.0.0.1:5502/login.html');
        });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required.' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.get(query, [email], async (err, row) => {
        if (err) {
            console.error('Error fetching user data:', err.message);
            return res.status(500).send({ message: 'Internal server error' });
        }

        if (row) {
            const isPasswordValid = await bcrypt.compare(password, row.password);
            if (isPasswordValid) {
                // Redirect to index.html on successful login
                res.redirect('http://127.0.0.1:5502/index.html');
            } else {
                res.status(401).send({ message: 'Invalid email or password' });
            }
        } else {
            res.status(401).send({ message: 'Invalid email or password' });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});