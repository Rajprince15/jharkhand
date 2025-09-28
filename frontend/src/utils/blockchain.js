/**
 * Utility function to check if blockchain features should be shown
 * @returns {boolean} - true if blockchain features should be shown, false to hide them
 */
export const isBlockchainEnabled = () => {
  const hideBlockchain = process.env.REACT_APP_HIDE_BLOCKCHAIN === 'true';
  return !hideBlockchain;
};