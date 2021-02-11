const panelController = (categoryRepository, revenueRepository) => async (_, res) => {
  let [categories, revenue] = await Promise.all([
    categoryRepository.findAll(),
    revenueRepository.getCurrentRevenue()
  ]);

  if (!revenue) {
    revenue = { value: 1.5 };
  }

  const serializedContent = JSON.stringify({ revenue, categories });
  res.render('panel.njk', { serializedContent });
};

module.exports = panelController;
