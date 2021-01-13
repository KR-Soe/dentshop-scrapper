var socket = io();

socket.on('notify', (notification) => {
  console.log('llego la notif', notification);
  const wrapper = $('#notifications');
  const element = document.createElement('p');
  element.textContent = notification.message;
  wrapper.insertBefore(element, wrapper.firstChild);
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
  console.log('emitting from now')
  socket.emit('startSync');
}
