const express = require('express');
const router = express.Router();
const DB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('backend_data/alerts.json');
const db = DB(adapter);

if(!db.has('alerts').value()) db.set('alerts', []).write();

// list alerts
router.get('/', (req, res) => {
  res.json(db.get('alerts').value());
});

// create alert (called by frontend when weapon/person detected)
router.post('/', (req, res) => {
  const a = req.body;
  a.id = Date.now();
  db.get('alerts').push(a).write();
  // (Placeholder) Send email/SMS here using configured providers if present.
  res.json({ success: true, alert: a });
});

module.exports = router;
