const EventTypes = Object.freeze({
  SYNC_NOTIFY: 'sync:notify',
  SYNC_ERROR: 'sync:error',
  SYNC_FINISHED: 'sync:finished',
  SYNC_START: 'sync:start',
  REVENUE_UPDATE: 'revenue:update',
  REVENUE_NOTIFY: 'revenue:notify',
  CATEGORY_UPDATE: 'categories:update',
  CATEGORY_NOTIFY: 'categories:notify'
});

module.exports = EventTypes;
