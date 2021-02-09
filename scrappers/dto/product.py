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
        self.revenue_price = None
        self.created_at = None
        self._categories = []
        self._missing_field = None

    def _is_valid(self):
        attributes = [attr for attr in vars(self) if not attr.startswith('_')]

        for field in attributes:
            if getattr(self, field) is None:
                self._missing_field = field
                return False

        if len(self._categories) == 0:
            self._missing_field = 'categories'
            return False

        return True

    def add_category(self, category):
        formatted_category = category.upper()\
            .replace('Á', 'A')\
            .replace('É', 'E')\
            .replace('Í', 'I')\
            .replace('Ó', 'O')\
            .replace('Ú', 'U')

        self._categories.append(formatted_category)

    def to_serializable(self):
        if not self._is_valid():
            message = f'This product is not completed because of {self._missing_field} on {self.refer_url}'
            raise Exception(message)

        return {
            'title': self.title,
            'internetPrice': int(self.price),
            'revenuePrice': int(self.revenue_price),
            'stock': int(self.stock),
            'sku': self.sku,
            'category': self._categories,
            'brand': self.brand,
            'description': self.description.strip(),
            'image': self.image,
            'referUrl': self.refer_url,
            'platformSource': self.platform_source,
            'createdAt': self.created_at
        }
