const express = require('express');
const planes = require('./planes');
const getDashboard = require('./dashboard');
const app = express();
const port = process.env.PORT || 3001;

app.get('/result.json', async (req, res) => {
    const all = await planes.getPlanes();

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(all, null, 2));
});

app.get('/result.txt', async (req, res) => {
    const all = await planes.getPlanes();

    res.set('Content-Type', 'text/plain');
    res.send(all.map(p => p.toString()).join('\n'));
});

app.get('/result.png', async (req, res) => {
    const all = await planes.getPlanes();
    const canvas = getDashboard(all);
    const img = await canvas.encode('png');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
});

app.get('/result.jpg', async (req, res) => {
    const all = await planes.getPlanes();
    const canvas = getDashboard(all);
    const img = await canvas.encode('jpeg');

    res.writeHead(200, {
      'Content-Type': 'image/jpg',
      'Content-Length': img.length
    });
    res.end(img);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})