const fs = require('fs').promises;
const { Row } = require('./csv');

async function parseCSVContents(filename) {
  const contents = await fs.readFile(filename, 'utf-8');

  return contents
    .split('\n')
    .slice(1)
    .map(line => line.trim())
    .filter(line => line)
    .map(fromCSVRowToObject);
}

function fromCSVRowToObject(line) {
  const fields = line.split(',').map(field => JSON.parse(field));
  return new Row(fields);
}

module.exports = parseCSVContents;
