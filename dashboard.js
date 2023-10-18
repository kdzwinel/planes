const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const PNG = require('pngjs').PNG;
const { getDistance } = require('geolib');
const path = require('path');

GlobalFonts.registerFromPath(path.join(__dirname, './NotoEmoji-Bold.ttf'), 'NotoEmoji');

function getAirline(plane) {
    return plane.airline ? plane.airline.name : '(unknown airline)';
}

function getDeparture(plane) {
    return plane.departure ? `${plane.departure.city}` : (plane.dep_icao || '?');
}

function getArrival(plane) {
    return plane.arrival ? `${plane.arrival.city}` : (plane.arr_icao || '?');
}

function distanceFromHome(plane) {
    return getDistance({
        latitude: process.env.HOME_LAT,
        longitude: process.env.HOME_LON
    }, {
        latitude: plane.latitude,
        longitude: plane.longitude
    });
}

function distanceFromHomeFormatted(plane) {
    const meters = distanceFromHome(plane);
    return (meters / 1000).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' km';
}

function printPlane(plane) {
    return `✈ ${getAirline(plane)} ${plane.callsign} (${getDeparture(plane)} → ${getArrival(plane)})`;
}

function isFlying(plane) {
    if (plane.on_ground === true) {
        return false;
    } else if (plane.on_ground === false) {
        return true;
    } else {
        return plane.baro_altitude > 100 || plane.geo_altitude > 100;
    }
}

async function drawDashboard(planes, cacheDate) {
    const canvas = createCanvas(600, 800);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 800);

    ctx.fillStyle = '#000000';
    let nearPlane = 0;
    let farPlane = 0;

    planes
        .sort((a, b) => {
            return distanceFromHome(a) - distanceFromHome(b);
        })
        .forEach((plane, index) => {
            const topMargin = 65;
            const topLineSize = 25 + 20;
            const bottomLineSize = 50 + 10;
            const unitSize = topLineSize + bottomLineSize;
            const distance = distanceFromHome(plane);

            // if far, make it less prominent
            if (distance > 10000) {
                ctx.fillStyle = '#a9a9a9';
                farPlane++;

                // separator between planes that are close and far
                if(nearPlane > 0 && farPlane === 1) {
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(0, unitSize * index + topMargin - topLineSize);
                    ctx.lineTo(600, unitSize * index + topMargin - topLineSize);
                    ctx.closePath();
                    ctx.stroke();
                }
            } else {
                ctx.fillStyle = '#000000';
                nearPlane++;
            }

            ctx.font = '30px serif';
            ctx.fillText(`${getAirline(plane)} ${plane.callsign} (${distanceFromHomeFormatted(plane)})`, 10, unitSize * index + topMargin);
            ctx.font = '50px serif';
            ctx.fillText(`${getDeparture(plane)} › ${getArrival(plane)}`, 45, unitSize * index + topMargin + topLineSize);
            ctx.font = '30px NotoEmoji';
            ctx.fillText(isFlying(plane) ? '\u{2708}\u{FE0F}' : '\u{1F6EC}', 5, unitSize * index + topMargin + topLineSize - 5);
        });

    const date = new Date();
    let dateText = 'Image date: ' + date.toLocaleString('pl-PL', {timeZone: 'Europe/Warsaw'});

    if (cacheDate) {
        dateText += ', data date: ' + cacheDate.toLocaleString('pl-PL', {timeZone: 'Europe/Warsaw'});
    }

    ctx.fillStyle = '#000000';
    ctx.font = '14px serif';
    ctx.fillText(dateText, 10, 790);

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