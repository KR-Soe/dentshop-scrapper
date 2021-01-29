const revenueRepository = require('../repositories/revenue');

async function panelController(_, res) {
  let [ revenue ] = await revenueRepository.getCurrentRevenue();

  console.log('revenue', revenue);

  if (!revenue) {
    revenue = { value: 1.5 };
  }

  res.render('panel.njk', { serializedContent: JSON.stringify({ revenue }) });
}

module.exports = panelController;
