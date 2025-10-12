const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const detectRoute = require('./routes/detect');
const alertsRoute = require('./routes/alerts');
const logsRoute = require('./routes/logs');
const settingsRoute = require('./routes/settings');
const usersRoute = require('./routes/users');
const login = require('./routes/login');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/detect', detectRoute);
app.use('/api/alerts', alertsRoute);
app.use('/api/logs', logsRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/users', usersRoute);
app.use('/api/login', login);
// fallback to index.html for routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/',(req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
// app.get('/', (req, res) => {
//     res.redirect('/login.html');
// });
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
