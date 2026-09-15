const express = require('express');
const app = express();
app.get('*all', (req, res) => res.send('ok'));
const req = { method: 'GET', url: '/' };
app.handle(req, { send: (m) => console.log('RESPONSE:', m) }, () => console.log('NEXT called (404)'));
