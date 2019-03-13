/**
 * Helper module for miscellaneous functions.
 */

// Refers to the common issue type (AD - ADR).
// See https://github.com/iexg/IEX-API/issues/264 for an explanation.
const stockTypeDescriptions = {
  ad: 'American Depository Receipt',
  re: 'Real Estate Investment Trust',
  ce: 'Closed end fund',
  si: 'Secondary Issue',
  lp: 'Limited Partnerships',
  cs: 'Common Stock',
  et: 'Exchange Traded Fund',
  crypto: 'Cryptocurrency',
  ps: 'Preferred Stock',
};

export const getStockTypeDescription = (type) => {
  return stockTypeDescriptions[type];
}