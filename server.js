const express = require('express');
const planes = require('./planes');
const { createCanvas } = require('@napi-rs/canvas')
const app = express();
const port = process.env.PORT || 3000;

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

    const canvas = createCanvas(600, 800);
    const ctx = canvas.getContext('2d');

    ctx.font = '20px Arial';
    all.forEach((p, index) => {
        ctx.fillText(p.toString(), 5, 25 * (index + 1));
    });

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#AFCBFF';
    ctx.fillStyle = '#0E1C36';
    //#D7F9FF, #F9FBF2, #FFEDE1

    ctx.strokeRect(0, 0, 600, 800);

    ctx.font = '12px Arial';
    ctx.fillText((new Date()).toString(), 10, 790);

    const img = await canvas.encode('png');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})