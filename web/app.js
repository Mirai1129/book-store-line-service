const path = require('path');

const cors = require('cors');
const express = require('express');
const session = require('express-session');

require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto', // 在 production 環境下 (https) 會自動設為 true
        maxAge: 24 * 60 * 60 * 1000
    }
}));


// --- Routes settings ---
const apiRouter = require('./src/routes/api/indexRoutes');
const viewRouter = require('./src/routes/viewsRoutes');


// --- Use Routes ---
app.use('/api', apiRouter);
app.use('/', viewRouter);

// --- start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));