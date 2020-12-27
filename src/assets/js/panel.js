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
  fetch('/api/sync')
    .then(response => response.json())
    .then(function(body) {
      alert(body.message);
    });
}
