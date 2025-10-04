const express = require('express');
const router = express.Router();
const DB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('backend_data/logs.json');
const db = DB(adapter);

if(!db.has('logs').value()) db.set('logs', []).write();

router.get('/', (req, res) => {
  res.json(db.get('logs').value());
});

router.post('/', (req, res) => {
  const entry = req.body;
  entry.id = Date.now();
  db.get('logs').push(entry).write();
  res.json({ success: true, entry });
});

module.exports = router;
