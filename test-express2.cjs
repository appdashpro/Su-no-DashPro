const express = require('express');
const app = express();
try {
  app.get('*all', (req, res) => res.send('ok'));
  console.log("EXPRESS ALLOWS *all");
} catch(e) {
  console.log("EXPRESS CRASHED on *all:", e.message);
}
