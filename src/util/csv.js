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
  constructor() {
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
  }

  toCSV() {
    return [
      this.permalink,
      this.namepermalink,
      this.descriptionpermalink,
      this.metaTitlepermalink,
      this.metaDescriptionpermalink,
      this.widthpermalink,
      this.lengthpermalink,
      this.heightpermalink,
      this.brandpermalink,
      this.barCodepermalink,
      this.categoriespermalink,
      this.imagespermalink,
      this.digitalpermalink,
      this.featuredpermalink,
      this.statuspermalink,
      this.skupermalink,
      this.weigthpermalink,
      this.stockpermalink,
      this.stockUnlimitedpermalink,
      this.pricepermalink,
      this.googleProductCategory
    ].join(',');
  }
}

module.exports = { CSV, Row };
