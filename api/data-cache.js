const planes = require('../planes.js');
const fs = require('fs');
const path = require('path');

async function handler(req, res) {
  const stateData = await planes.getPlanes();

  if (stateData) {
    const data = {
      date: Date.now(),
      states: stateData
    };
  
    fs.writeFileSync(path.join(__dirname, '../data/cache.json'), JSON.stringify(data, null, 2));
    res.status(200).end(`Data size: ${data.length}`);
  } else {
    res.status(204).end('No data.');
  }
};

handler();

module.exports = handler;