const EventTypes = require('./eventTypes');


class EventManager {
  constructor({ container, socket, logger, syncService }) {
    this.socket = socket;
    this.logger = logger;
    this.revenueRepository = container.get('revenueRepository');
    this.categoryRepository = container.get('categoryRepository');
    this.syncService = syncService;
    this.pricingService = container.get('pricingService');

    this._startSync = this._startSync.bind(this);
    this._updateRevenue = this._updateRevenue.bind(this);
    this._updateCategories = this._updateCategories.bind(this);
  }

  connect() {
    this.socket.on(EventTypes.SYNC_START, this._startSync);
    this.socket.on(EventTypes.REVENUE_UPDATE, this._updateRevenue);
    this.socket.on(EventTypes.CATEGORY_UPDATE, this._updateCategories);
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
    this.socket.emit(EventTypes.REVENUE_NOTIFY, {
      message: 'El valor fue actualizado exitosamente'
    });
  }

  async _updateCategories(payload) {
    const promises = payload
      .map(category => this.categoryRepository.save(category));

    await Promise.all(promises);
    const results = await this.categoryRepository.findAll();
    this.socket.emit(EventTypes.CATEGORY_NOTIFY, results);
  }
}


module.exports = EventManager;
