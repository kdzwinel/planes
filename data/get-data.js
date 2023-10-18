const fetch = require('node-fetch');
const fs = require('fs');
const csv=require('csvtojson');

const AIRLINES_URL = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat';
const AIRPORTS_URL = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';

function datToJSON(text, fields) {
    return csv()
        .fromString(fields.join(',') + '\n' + text);
}

fetch(AIRLINES_URL)
    .then(response => response.text())
    .then(async datText => {
        const json = await datToJSON(datText, ['id', 'name', 'alias', 'iata', 'icao', 'callsign', 'country', 'active']);
        fs.writeFileSync('./airlines.json', JSON.stringify(json, null, 2));
    });

fetch(AIRPORTS_URL)
    .then(response => response.text())
    .then(async datText => {
        const json = await datToJSON(datText, ['id', 'name', 'city', 'country', 'iata', 'icao', 'lat', 'lon', 'alt', 'timezone', 'dst', 'time', 'type', 'source']);
        fs.writeFileSync('./airports.json', JSON.stringify(json, null, 2));
    });