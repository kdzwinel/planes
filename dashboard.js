const { createCanvas } = require('@napi-rs/canvas');

module.exports = function (planes) {
    const canvas = createCanvas(600, 800);
    const ctx = canvas.getContext('2d');

    ctx.font = '20px Arial';
    planes.forEach((p, index) => {
        ctx.fillText(p.toString(), 5, 25 * (index + 1));
    });

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,600,800);

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';

    //#AFCBFF, #0E1C36, #D7F9FF, #F9FBF2, #FFEDE1

    ctx.strokeRect(0, 0, 600, 800);

    ctx.font = '12px Arial';
    ctx.fillText((new Date()).toString(), 10, 790);

    return canvas;
}