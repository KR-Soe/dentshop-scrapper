const fs = require('fs');
const path = require('path');
const { CSV, Row } = require('../util/csv');

async function controller(req, res) {
  const sourceRows = await importExistingProducts(req.file);
  const scrappedRows = await exportScrappedRows(sourceRows);
  const content = await createCSVFile(scrappedRows);

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment;filename=jumpseller.csv'
  });
  res.send(content);
}

async function importExistingRows(fileData) {
  console.log('fileData', fileData);
  return [];
}

async function exportScrappedRows(importedRows) {
  return [];
}

async function createCSVFile() {
  const csv = new CSV();

  const row = new Row();
  row.name = 'potatochu';
  csv.addRow(row);

  return csv.toCSV();
}

module.exports = controller;
