
const express = require('express');
const router = express.Router();
const DB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('backend_data/users.json');
const db = DB(adapter);
if(!db.has('users').value()) db.set('users', [
  { id: 1, name: 'admin', role: 'admin', password: 'admin' }
]).write();
router.post('/login', (req, res) => {
  const { name, password } = req.body;
  const user = db.get('users').find({ name, password }).value();
  if(user) return res.json({ success: true, user });
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});
module.exports = router