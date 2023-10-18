const express = require('express');
const planes = require('./planes');
const {drawDashboard,printPlane} = require('./dashboard');
const app = express();
const port = process.env.PORT || 3001;
const fs = require('fs');
let cacheDate = null;

function planesCached() {
    if (fs.existsSync('./data/cache.json')) {
        const raw = JSON.parse(fs.readFileSync('./data/cache.json'));
        cacheDate = new Date(raw.date);
        console.log('Using cached response.', cacheDate);

        return raw.states;
    } else {
        console.log('Calling live APIs.');
        return planes.getPlanes();
    }
}

app.get('/result.json', async (req, res) => {
    const all = await planesCached();

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(all, null, 2));
});

app.get('/result.txt', async (req, res) => {
    const all = await planesCached();

    res.set('Content-Type', 'text/plain');
    res.send(all.map(p => printPlane(p)).join('\n'));
});

app.get('/result.png', async (req, res) => {
    const all = await planesCached();
    const canvas = drawDashboard(all, cacheDate);
    const img = await canvas.encode('png');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
});

app.get('/result.jpg', async (req, res) => {
    const all = await planesCached();
    const canvas = drawDashboard(all, cacheDate);
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