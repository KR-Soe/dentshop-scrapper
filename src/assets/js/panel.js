const waitFor = (milliSeconds = 0) =>
  new Promise((resolve) => setTimeout(resolve, milliSeconds));

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

class TableRow {
  constructor(id, name, categories) {
    this.id = id;
    this.name = name;
    this.categories = categories || [];
  }

  toHTML() {
    const tr = document.createElement('tr');

    if (this.id) {
      tr.dataset.id = this.id;
    }

    const td1 = document.createElement('td');
    td1.contentEditable = true;
    td1.textContent = this.name;

    const td2 = document.createElement('td');
    td2.contentEditable = true;
    td2.textContent = this.categories.join(',');

    tr.appendChild(td1);
    tr.appendChild(td2);

    return tr;
  }
}

const onSyncNotify = (notification) => {
  const wrapper = $('#notifications');

  if (notification.updateLastNotification) {
    wrapper.firstChild.textContent = notification.message;
  } else {
    const element = document.createElement('p');
    element.textContent = notification.message;
    wrapper.insertBefore(element, wrapper.firstChild);
  }
};

const onRevenueNotify = (notification) => {
  const revNotification = $('#revenueNotification');
  revNotification.textContent = notification.message;
  revNotification.classList.remove('is-hidden');

  waitFor(1000).then(() => {
    revNotification.textContent = '';
    revNotification.classList.add('is-hidden');
  });
};

const onCategoryNotify = (newData) => {
  renderCategories(newData);
};

const socket = io();
const content = window.serializedContent;

socket.on('sync:notify', onSyncNotify);
socket.on('revenue:notify', onRevenueNotify);
socket.on('categories:notify', onCategoryNotify);

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

function updateCategories(categories) {
  socket.emit('categories:update', categories);
}

function createRow(category) {
  const row = new TableRow(
    category._id,
    category.category,
    category.synonyms
  );

  return row.toHTML();
}

function renderCategories(categories) {
  const table = $('#categoryList > tbody');

  while (table.lastChild) {
    table.removeChild(table.lastChild);
  }

  categories.map(createRow)
    .forEach(tr => table.appendChild(tr));
}

function saveCategories() {
  const formatText = text => text.trim().toUpperCase();

  const cats = Array.from($$('#categoryList > tbody > tr'))
    .map(cat => {
      return {
        _id: cat.dataset.id,
        category: formatText(cat.firstChild.textContent),
        synonyms: cat.lastChild.textContent.split(',').map(formatText)
      };
    });

  updateCategories(cats);
}

function addNewCategory() {
  const table = $('#categoryList > tbody');
  const row = new TableRow();
  table.appendChild(row.toHTML());
}

(function init() {
  $('#revenue').value = content.revenue.value;
  $('#saveCategoriesButton').addEventListener('click', saveCategories);
  $('#addNewCategoryButton').addEventListener('click', addNewCategory);
  renderCategories(content.categories);
})();
