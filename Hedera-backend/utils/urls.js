function getExplorerUrl(tokenId, network) {
  const baseUrl = network === 'mainnet' ? 'https://hashscan.io' : 'https://hashscan.io/testnet';
  return `${baseUrl}/token/${tokenId}`;
}

function getDexUrls(tokenId, network) {
  if (network === 'mainnet') {
    return {
      saucerswap: `https://app.saucerswap.finance/swap?inputCurrency=HBAR&outputCurrency=${tokenId}`,
      heliswap: `https://app.heliswap.io/swap?from=HBAR&to=${tokenId}`,
      pangolin: `https://app.pangolin.exchange/#/swap?inputCurrency=HBAR&outputCurrency=${tokenId}`,
      hashpack_dex: `https://www.hashpack.app/dex?from=HBAR&to=${tokenId}`,
    };
  } else {
    return {
      saucerswap_testnet: `https://testnet.app.saucerswap.finance/swap?inputCurrency=HBAR&outputCurrency=${tokenId}`,
      hashscan_testnet: `https://hashscan.io/testnet/token/${tokenId}`,
      note: '⚠️ Limited DEX availability on testnet. Token will be fully available on mainnet DEXs.',
    };
  }
}

module.exports = { getExplorerUrl, getDexUrls };


