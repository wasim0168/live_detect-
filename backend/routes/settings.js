const express = require('express');
const router = express.Router();
const DB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('backend_data/settings.json');
const db = require('lowdb')(adapter);

if(!db.has('settings').value()) db.set('settings', {
  camera_source: 'webcam',
  imgsz: 640,
  conf: 0.5,
  alert_on_weapon: true
}).write();

router.get('/', (req, res) => res.json(db.get('settings').value()));
router.post('/', (req, res) => {
  const s = req.body;
  db.set('settings', s).write();
  res.json({ success: true, settings: s });
});

module.exports = router;
