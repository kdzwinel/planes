const fetch = require('node-fetch');
const Address = require('./icao.js');
const config = require('./CONFIG.js');

const ALL_STATES_METHOD = 'states/all';
const FLIGHT_INFO = 'flight';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api/';
const AIRLABS_BASE_URL = 'https://airlabs.co/api/v9/';

async function callAPIMethod(method, params) {
    let baseURL = OPENSKY_BASE_URL;

    if (method === FLIGHT_INFO) {
        baseURL = AIRLABS_BASE_URL;
        params['api_key'] = config.airlabs_key;
    }

    const url = new URL(baseURL);
    url.pathname += method;
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url);
    return await response.json();
}

async function getAllStates(location) {
    const data = await callAPIMethod(ALL_STATES_METHOD, { lamin: location.latMin, lamax: location.latMax, lomin: location.lonMin, lomax: location.lonMax });
    let states = [];

    if (data.states) {
        states = data.states.map(state => new State(state));
    }

    return states;
}

async function getFlight(icao24) {
    console.log(icao24, Address.ToTailNumber(`0x${icao24}`));
    const data = await callAPIMethod(FLIGHT_INFO, { flight_icao: Address.ToTailNumber(`0x${icao24}`) });

    console.log(data);
}

class State {
    constructor(inputArray) {
        const STATE_FIELDS = ['icao24', 'callsign', 'origin_country', 'time_position', 'last_contact', 'longitude', 'latitude', 'baro_altitude', 'on_ground', 'velocity', 'true_track', 'vertical_rate', 'sensors', 'geo_altitude', 'squawk', 'spi', 'position_source', 'category'];

        STATE_FIELDS.forEach((fieldName, index) => this[fieldName] = inputArray[index]);

        getFlight(this.icao24);
    }

    toString() {
        console.log(`✈️ ${this.callsign} (${this.from}, ${this.to})`);
    }
}

async function main() {
    const states = await getAllStates(config.location);
    states.forEach(state => console.log(state))
}

main();