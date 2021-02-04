const socket = io();
const wrapper = $('#notifications');
const content = window.serializedContent;

const waitFor = (milliSeconds = 0) =>
  new Promise((resolve) => setTimeout(resolve, milliSeconds));

socket.on('sync:notify', (notification) => {
  const wrapper = $('#notifications');

  if (notification.updateLastNotification) {
    wrapper.firstChild.textContent = notification.message;
  } else {
    const element = document.createElement('p');
    element.textContent = notification.message;
    wrapper.insertBefore(element, wrapper.firstChild);
  }
});

socket.on('revenue:notify', (notification) => {
  const revNotification = $('#revenueNotification');
  revNotification.textContent = notification.message;
  revNotification.classList.remove('is-hidden');

  waitFor(1000).then(() => {
    revNotification.textContent = '';
    revNotification.classList.add('is-hidden');
  });
});

function $$(selector) {
  return document.querySelectorAll(selector);
}

function $(selector) {
  return document.querySelector(selector);
}

function useTab(option) {
  Array.from($$('#tabList > li'))
    .forEach(function(item) {
      item.classList.remove('is-active');
    });

  $(`#tabList li[data-option=${option}]`).classList.add('is-active');

  Array.from($$('[data-container]'))
    .forEach(function(container) {
      container.classList.add('is-hidden');
    });

  $(`#${option}`).classList.remove('is-hidden');
}

function sync() {
  socket.emit('sync:start');
}

function updateRevenue() {
  const currentValue = Number.parseFloat($('#revenue').value);

  if (!currentValue) {
    return;
  }

  content.revenue.value = currentValue;
  socket.emit('revenue:update', { revenue: content.revenue });
}

function updateCategories() {
  // en resumen aqui es donde mandas las categorias
  const categories = [];
  socket.emit('categories:update', categories);
}

(function init() {
  $('#revenue').value = content.revenue.value;
})();
