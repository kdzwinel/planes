const fetch = require('node-fetch');
const AIRPORTS = require('./airports.json');
const AIRLINES = require('./airlines.json');

const ALL_STATES_METHOD = 'states/all';
const FLIGHT_INFO = 'flight';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api/';
const OPENSKY_CREDENTIALS = process.env.OPENSKY_CREDENTIALS;
const AIRLABS_BASE_URL = 'https://airlabs.co/api/v9/';
const AIRLABS_KEY = process.env.AIRLABS_KEY;
const LOCATION = {
    latMin: process.env.LAT_MIN,
    latMax: process.env.LAT_MAX,
    lonMin: process.env.LON_MIN,
    lonMax: process.env.LON_MAX
};

function findAirport(icao) {
    return AIRPORTS.find(a => a.icao === icao);
}

function findAirline(icao) {
    return AIRLINES.find(a => a.icao === icao);
}

async function callAPIMethod(method, params) {
    let baseURL = OPENSKY_BASE_URL;
    let fetchConfig = {}

    if (method === FLIGHT_INFO) {
        baseURL = AIRLABS_BASE_URL;
        params['api_key'] = AIRLABS_KEY;
    } else if (method === ALL_STATES_METHOD) {
        fetchConfig = {
            headers: {
                'Authorization': 'Basic ' + btoa(OPENSKY_CREDENTIALS)
            }
        };
    }

    const url = new URL(baseURL);
    url.pathname += method;
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url, fetchConfig);
    
    let data = null;

    try {
        data = await response.json();
    } catch (e) {
        console.warn('JSON parsing failed', e);
    }

    return data;
}

async function getAllStates(location) {
    const data = await callAPIMethod(ALL_STATES_METHOD, { lamin: location.latMin, lamax: location.latMax, lomin: location.lonMin, lomax: location.lonMax });
    let states = [];

    console.log(`Found ${(data && data.states) ? data.states.length : 0} states matching location.`);

    if (data && data.states) {
        for (const stateInfo of data.states) {
            stateInfo[1] = stateInfo[1].trim();
            const callsign = stateInfo[1];
            console.log(`Fetching flight data for ${callsign}.`);

            const flightInfo = await getFlight(callsign);
            states.push(new State(stateInfo, flightInfo));
        }
    }

    return states;
}

async function getFlight(callsign) {
    const data = await callAPIMethod(FLIGHT_INFO, { flight_icao: callsign });

    return data && data.response;
}

class State {
    constructor(stateInfo, flightInfo) {
        const STATE_FIELDS = ['icao24', 'callsign', 'origin_country', 'time_position', 'last_contact', 'longitude', 'latitude', 'baro_altitude', 'on_ground', 'velocity', 'true_track', 'vertical_rate', 'sensors', 'geo_altitude', 'squawk', 'spi', 'position_source', 'category'];
        STATE_FIELDS.forEach((fieldName, index) => this[fieldName] = stateInfo[index]);

        if (flightInfo) {
            const FLIGHT_FIELDS = ['dep_icao', 'arr_icao', 'type', 'manufacturer', 'engine', 'model', 'built', 'airline_icao', 'airline_iata'];
            FLIGHT_FIELDS.forEach(fieldName => this[fieldName] = flightInfo[fieldName]);

            this.departure = findAirport(this.dep_icao);
            this.arrival = findAirport(this.arr_icao);
            this.airline = findAirline(this.airline_icao);
        }
    }

    toString() {
        const airline = this.airline ? this.airline.name : '(unknown airline)';
        const from = this.departure ? `${this.departure.city}/${this.departure.country}` : (this.dep_icao || '?');
        const to = this.arrival ? `${this.arrival.city}/${this.arrival.country}` : (this.arr_icao || '?');

        return `✈ ${airline} ${this.callsign} (${from} → ${to})`;
    }
}

async function getPlanes() {
    const states = await getAllStates(LOCATION);

    console.log('Showing final data:');
    states.forEach(state => console.log(state.toString()))

    return states;
}

module.exports = {
    getPlanes
};
