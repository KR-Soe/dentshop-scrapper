const { CSV, Row } = require('../util/csv');
const parseCSVContents = require('../util/csvparser');
const exprodentalRepository = require('../repositories/exprodental');

async function controller(req, res) {
  const importedProducts = await parseCSVContents(req.file.path);
  const scrappedRows = await exportScrappedRows(importedProducts);
  const content = await createCSVFile(scrappedRows);

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment;filename=jumpseller.csv'
  });

  res.send(content);
}

async function exportScrappedRows(importedRows) {
  const scrappedProducts = await exprodentalRepository.findAll();
  return scrappedProducts.map(collectionToCSVRow);
}

function collectionToCSVRow(element) {
  const row = new Row();

  row.name = element.title;
  row.categories = element.category;
  row.price = element.internetPrice;
  row.description = element.description;
  row.stock = element.stock;
  row.sku = element.sku;
  row.images = element.image;
  row.brand = element.brand;

  return row;
}

async function createCSVFile(rows) {
  const csv = new CSV();

  rows.forEach(row => {
    csv.addRow(row);
  });

  return csv.toCSV();
}

module.exports = controller;
