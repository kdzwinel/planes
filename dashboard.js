const { createCanvas } = require('@napi-rs/canvas');
const PNG = require('pngjs').PNG;

function getAirline(plane) {
    return plane.airline ? plane.airline.name : '(unknown airline)';
}

function getDeparture(plane) {
    return plane.departure ? `${plane.departure.city}/${plane.departure.country}` : (plane.dep_icao || '?');
}

function getArrival(plane) {
    return plane.arrival ? `${plane.arrival.city}/${plane.arrival.country}` : (plane.arr_icao || '?');
}

function printPlane(plane) {
    return `✈ ${getAirline(plane)} ${plane.callsign} (${getDeparture(plane)} → ${getArrival(plane)})`;
}

async function drawDashboard (planes, cacheDate) {
    const canvas = createCanvas(600, 800);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0,0,600,800);

    ctx.fillStyle = '#000000';
    planes.forEach((plane, index) => {
        const topMargin = 25;
        const topLineSize = 25;
        const bottomLineSize = 30;
        const unitSize = topLineSize + bottomLineSize;

        ctx.font = '15px serif';
        ctx.fillText(`${getAirline(plane)} ${plane.callsign}`, 10, unitSize * index + topMargin);
        ctx.font = '25px serif';
        ctx.fillText(`${getDeparture(plane)} → ${getArrival(plane)}`, 20, unitSize * index + topMargin + topLineSize);
    });

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';

    //#AFCBFF, #0E1C36, #D7F9FF, #F9FBF2, #FFEDE1

    ctx.strokeRect(0, 0, 600, 800);

    ctx.font = '12px serif';
    if (cacheDate) {
        ctx.fillText('Data date: ' + cacheDate, 10, 777);
    }
    ctx.fillText('Image date: ' + (new Date()).toString(), 10, 790);

    // convert PNG to colorType=0 (grayscale) so that Kindle can correctly display it
    const rgbPNG = await canvas.encode('png');
    const workPNG = PNG.sync.read(rgbPNG);

    return PNG.sync.write(workPNG, {
        width: 600,
        height: 800,
        colorType: 0
    });
}

module.exports = {
    printPlane,
    drawDashboard
}