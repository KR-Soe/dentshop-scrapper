class EventManager {
  constructor({
    socket,
    logger,
    revenueRepository,
    categoryRepository,
    syncService,
    pricingService
  }) {
    this.socket = socket;
    this.logger = logger;
    this.revenueRepository = revenueRepository;
    this.categoryRepository = categoryRepository;
    this.syncService = syncService;
    this.pricingService = pricingService;

    this._startSync = this._startSync.bind(this);
    this._updateRevenue = this._updateRevenue.bind(this);
    this._updateCategories = this._updateCategories.bind(this);
  }

  connect() {
    this.socket.on('sync:start', this._startSync);
    this.socket.on('revenue:update', this._updateRevenue);
    this.socket.on('categories:update', this._updateCategories);
  }

  async _startSync() {
    this.logger.info('starting with the sync !!!');
    const result = await this.syncService.startSync();
    this.logger.info(result);
  }

  async _updateRevenue(payload) {
    const { revenue } = payload;
    await this.revenueRepository.save(revenue);
    this.pricingService.setRevenue(revenue);
    this.socket.emit('revenue:notify', { message: 'El valor fue actualizado exitosamente' });
  }

  async _updateCategories(payload) {
    const promises = payload
      .map(category => this.categoryRepository.save(category));

    await Promise.all(promises);
    const results = await this.categoryRepository.findAll();
    this.socket.emit('categories:notify', results);
  }
}


module.exports = EventManager;
