class Product:
    def __init__(self):
        self.title = None
        self.price = None
        self.stock = None
        self.sku = None
        self.brand = None
        self.description = None
        self.image = None
        self.refer_url = None
        self.platform_source = None
        self._categories = []
        self._missing_field = None

    def _is_valid(self):
        attributes = vars(self)

        for field in attributes:
            if field.startswith('_'):
                continue

            if getattr(self, field) is None:
                self._missing_field = field
                return False

        if len(self._categories) == 0:
            self._missing_field = 'categories'
            return False

        return True

    def add_category(self, category):
        self._categories.append(category)

    def to_serializable(self):
        if not self._is_valid():
            raise Exception(f'This product is not completed because of {self._missing_field} on {self.refer_url}')

        return {
            'title': self.title,
            'internetPrice': int(self.price),
            'stock': int(self.stock),
            'sku': self.sku,
            'category': self._categories,
            'brand': self.brand,
            'description': self.description.strip(),
            'image': self.image,
            'referUrl': self.refer_url,
            'platformSource': self.platform_source
        }
