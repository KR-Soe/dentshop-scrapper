class CSV {
  constructor() {
    this.headers = [
      'Permalink',
      'Name',
      'Description',
      'Meta Title',
      'Meta Description',
      'Width',
      'Length',
      'Height',
      'Brand',
      'Barcode',
      'Categories',
      'Images',
      'Digital',
      'Featured',
      'Status',
      'SKU',
      'Weight',
      'Stock',
      'Stock Unlimited',
      'Price',
      'Google Product Category'
    ];
    this.rows = [];
  }

  addRow(row) {
    this.rows.push(row.toCSV());
  }

  toCSV() {
    return [
      this.headers.join(','),
      ...this.rows
    ].join('\n');
  }
}

class Row {
  constructor(initialData) {
    this.permalink = '';
    this.name = '';
    this.description = '';
    this.metaTitle = '';
    this.metaDescription = '';
    this.width = '';
    this.length = '';
    this.height = '';
    this.brand = '';
    this.barCode = '';
    this.categories = '';
    this.images = '';
    this.digital = '';
    this.featured = '';
    this.status = '';
    this.sku = '';
    this.weigth = '';
    this.stock = '';
    this.stockUnlimited = '';
    this.price = '';
    this.googleProductCategory = '';

    if (Array.isArray(initialData)) {
      this._populateFields(initialData);
    }
  }

  _populateFields(fields) {
    this.permalink = fields[0];
    this.name = fields[1];
    this.description = fields[2];
    this.metaTitle = fields[3];
    this.metaDescription = fields[4];
    this.width = Number.parseFloat(fields[5]);
    this.length = Number.parseFloat(fields[6]);
    this.height = Number.parseFloat(fields[7]);
    this.brand = fields[8];
    this.barCode = fields[9];
    this.categories = fields[10];
    this.images = fields[11];
    this.digital = fields[12];
    this.featured = fields[13];
    this.status = fields[14];
    this.sku = fields[15];
    this.weigth = Number.parseFloat(fields[16]);
    this.stock = Number.parseInt(fields[17]);
    this.stockUnlimited = fields[18];
    this.price = Number.parseFloat(fields[19]);
    this.googleProductCategory = fields[20];
  }

  toCSV() {
    return [
      this.permalink,
      this.name,
      this.description.replace(/"/g, ''),
      this.metaTitle,
      this.metaDescription,
      this.width,
      this.length,
      this.height,
      this.brand,
      this.barCode,
      this.categories,
      this.images,
      this.digital,
      this.featured,
      this.status,
      this.sku,
      this.weigth,
      this.stock,
      this.stockUnlimited,
      this.price,
      this.googleProductCategory
    ].map(field => `"${field}"`).join(',');
  }
}

module.exports = { CSV, Row };
