// Chain IDs
exports.ChainId = {
    ETHEREUM: 1,
    ARBITRUM: 42161,
    OPTIMISM: 10,
    POLYGON: 137,
    BASE: 8453,
    // Add more chains as needed
  };
  
  // Fee tiers in basis points (0.01% = 1 basis point)
  exports.FEE_TIERS = {
    LOWEST: 100,   // 0.01%
    LOW: 500,      // 0.05%
    MEDIUM: 3000,  // 0.3%
    HIGH: 10000    // 1%
  };
  
  // Default addresses for Uniswap V3 contracts
  exports.DEFAULT_CONTRACTS = {
    // Ethereum Mainnet
    1: {
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      nftManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
    },
    // Arbitrum One
    42161: {
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      nftManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
    },
    // Add more chains as needed
  };
  
  // Common tokens by chain ID
  exports.TOKENS = {
    // Ethereum Mainnet
    1: {
      'ETH': { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' },
      'WETH': { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
      'USDC': { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      'USDT': { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      'DAI': { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      'WBTC': { symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' }
    },
    // Arbitrum One
    42161: {
      'ETH': { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' },
      'WETH': { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
      'USDC': { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' },
      'USDT': { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
      'DAI': { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' },
      'WBTC': { symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f' }
    },
    // Add more chains as needed
  };