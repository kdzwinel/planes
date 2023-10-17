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
    const ctx = canvas.getContext('2d')

    ctx.font = '20px Impact';
    all.forEach((p, index) => {
        ctx.fillText(p.toString(), 5, 25 * (index + 1));
    });

    ctx.font = '12px Impact';
    ctx.fillText(new Date(), 5, 790);

    const stream = canvas.createPNGStream();

    res.set('Content-Type', 'image/png');

    stream.on('end', () => res.end());
    stream.pipe(res);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})