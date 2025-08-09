function validateTokenInput(req, res, next) {
  const { name, symbol, supply, decimals, description, creatorWallet, extensionLink } = req.body;

  if (!name || name.length > 100) {
    return res.status(400).json({ success: false, error: 'Invalid token name (1-100 characters)' });
  }

  if (!symbol || symbol.length > 10) {
    return res.status(400).json({ success: false, error: 'Invalid token symbol (1-10 characters)' });
  }

  if (!creatorWallet || !creatorWallet.match(/^\d+\.\d+\.\d+$/)) {
    return res.status(400).json({ success: false, error: 'Valid creator wallet required (format: 0.0.123456)' });
  }

  const supplyNum = parseInt(supply);
  if (!supplyNum || supplyNum <= 0 || supplyNum > 1000000000) {
    return res.status(400).json({ success: false, error: 'Supply must be between 1 and 1,000,000,000' });
  }

  const decimalsNum = parseInt(decimals || 9);
  if (decimalsNum < 0 || decimalsNum > 18) {
    return res.status(400).json({ success: false, error: 'Decimals must be between 0 and 18' });
  }

  if (!extensionLink || !/^https?:\/\//.test(extensionLink)) {
    return res.status(400).json({ success: false, error: 'Valid extension download URL required' });
  }

  req.body.name = name.trim();
  req.body.symbol = symbol.trim().toUpperCase();
  req.body.supply = supplyNum;
  req.body.decimals = decimalsNum;
  req.body.description = description ? description.trim() : '';
  req.body.creatorWallet = creatorWallet.trim();
  req.body.extensionLink = extensionLink.trim();

  next();
}

module.exports = { validateTokenInput };


