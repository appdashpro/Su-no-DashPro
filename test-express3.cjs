const express = require('express');
const request = require('supertest');
const app = express();
app.get('*all', (req, res) => res.send('ok'));
request(app).get('/').expect(200).then(() => console.log('MATCHED')).catch(e => console.log('FAILED TO MATCH:', e.message));
