const revenueRepository = require('../repositories/revenue');
const categoryRepository = require('../repositories/categories');

async function panelController(_, res) {
  const categories = await categoryRepository.findAll();
  let [ revenue ] = await revenueRepository.getCurrentRevenue();

  if (!revenue) {
    revenue = { value: 1.5 };
  }

  const serializedContent = JSON.stringify({
    revenue,
    categories
  });

  res.render('panel.njk', { serializedContent });
}

module.exports = panelController;
