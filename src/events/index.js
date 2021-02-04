const syncService = require('../services/sync');
const revenueRepository = require('../repositories/revenue');
const categoryRepository = require('../repositories/categories');
const mailService = require('../services/mailer');


class EventManager {
  constructor(socket, logger) {
    this.socket = socket;
    this.logger = logger;

    this._startSync = this._startSync.bind(this);
    this._updateRevenue = this._updateRevenue.bind(this);
  }

  connect() {
    this.socket.on('sync:start', this._startSync);
    this.socket.on('revenue:update', this._updateRevenue);
    this.socket.on('categories:update', this._updateCategories);
  }

  async _startSync() {
    this.logger.info('starting with the sync !!!');
    const result = await syncService(this.logger, this.socket, mailService);
    this.logger.info(result);
  }

  async _updateRevenue(payload) {
    const { revenue } = payload;
    await revenueRepository.saveRevenue(revenue);
    this.socket.emit('revenue:notify', { message: 'El valor fue actualizado exitosamente' });
  }

  async _updateCategories(payload) {
    const promises = payload.categories
      .map(category => categoryRepository.saveCategory(category));

    await Promise.all(promises);
  }
}


module.exports = EventManager;
