export const HEADER = {
  langToggle: "lang-toggle",
  brand: "brand-logo",
};

export const NAV = {
  prices: "nav-prices",
  mills: "nav-mills",
  market: "nav-market",
};

export const PRICES = {
  ticker: "price-ticker",
  card: (id) => `price-card-${id}`,
  chart: "price-chart",
};

export const MILLS = {
  filterCategory: (id) => `mill-filter-cat-${id}`,
  filterDistrict: "mill-filter-district",
  card: (id) => `mill-card-${id}`,
  callBtn: (id) => `mill-call-${id}`,
  verifiedBadge: (id) => `mill-verified-${id}`,
};

export const MARKET = {
  categoryTab: (id) => `market-tab-${id}`,
  card: (id) => `market-card-${id}`,
  unlockBtn: (id) => `unlock-contact-btn-${id}`,
  revealedPhone: (id) => `revealed-phone-${id}`,
};

export const UNLOCK = {
  dialog: "unlock-dialog",
  payBtn: "unlock-pay-btn",
  cancelBtn: "unlock-cancel-btn",
  revealBtn: "unlock-reveal-btn",
  processing: "unlock-processing",
  success: "unlock-success",
};
