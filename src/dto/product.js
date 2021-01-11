class Product {
  constructor(initialData = {}) {
    this.id = initialData.id || null;
    this.name = initialData.name || null;
    this.pageTitle = initialData.page_title || null;
    this.description = initialData.description || null;
    this.metaDescription = initialData.meta_description || null;
    this.price = initialData.price || null;
    this.weight = initialData.weight || null;
    this.stock = initialData.stock || null;
    this.stockUnlimited = initialData.stock_unlimited || null;
    this.sku = initialData.sku || null;
    this.brand = initialData.brand || null;
    this.barcode = initialData.barcode || null;
    this.featured = initialData.featured || null;
    this.status = initialData.status || null;
    this.shippingRequired = initialData.shipping_required || null;
    this.createdAt = initialData.created_at || null;
    this.updatedAt = initialData.updated_at || null;
    this.packageFormat = initialData.package_format || null;
    this.length = initialData.length || null;
    this.width = initialData.width || null;
    this.height = initialData.height || null;
    this.diameter = initialData.diameter || null;
    this.googleProductCategory = initialData.google_product_category || null;
    this.categories = initialData.categories || [];
    this.images = initialData.images || [];
    this.variants = initialData.variants || [];
    this.fields = initialData.fields || [];
    this.permalink = initialData.permalink || null;
    this.discount = initialData.discount || null;
    this.currency = initialData.currency || 'CLP';
  }

  toJSON(removeNulls = false) {
    const data = {
      "id": this.id,
      "name": this.name,
      "page_title": this.pageTitle,
      "description": this.description,
      "meta_description": this.metaDescription,
      "price": this.price,
      "weight": this.weight,
      "stock": this.stock,
      "stock_unlimited": this.stockUnlimited,
      "sku": this.sku,
      "brand": this.brand,
      "barcode": this.barcode,
      "featured": this.featured,
      "status": this.status,
      "shipping_required": this.shippingRequired,
      "created_at": this.createdAt,
      "updated_at": this.updatedAt,
      "package_format": this.packageFormat,
      "length": this.length,
      "width": this.width,
      "height": this.height,
      "diameter": this.diameter,
      "google_product_category": this.googleProductCategory,
      "categories": this._toArray(this.categories),
      "images": this._toArray(this.images),
      "variants": this._toArray(this.variants),
      "fields": this._toArray(this.fields),
      "permalink": this.permalink,
      "discount": this.discount,
      "currency": this.currency
    };

    if (!removeNulls) {
      return data;
    }

    const newData = Object.keys(data)
      .filter(key => data[key] !== null)
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    return newData;
  }

  _toArray(field) {
    if (Array.isArray(field)) {
      return field;
    }

    return field ? field.split(',') : null;
  }
}


module.exports = Product;
