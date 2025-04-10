const { ethers } = require('ethers');
const { DEFAULT_CONTRACTS } = require('./constants');

// Global variables
let privateKey = null;
let providers = {};

// ABI fragments for Uniswap V3 contracts
const FACTORY_ABI = [
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'
];

const NFT_MANAGER_ABI = [
  'function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
  'function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline) params) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
  'function increaseLiquidity(tuple(uint256 tokenId, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params) external payable returns (uint128 liquidity, uint256 amount0, uint256 amount1)',
  'function decreaseLiquidity(tuple(uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params) external payable returns (uint256 amount0, uint256 amount1)',
  'function collect(tuple(uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max) params) external payable returns (uint256 amount0, uint256 amount1)',
  'function burn(uint256 tokenId) external payable'
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
];

// Set private key for transactions
exports.setPrivateKey = function(key) {
  privateKey = key;
};

// Set RPC URL for a specific chain
exports.setRpcUrl = function(chainId, url) {
  providers[chainId] = new ethers.providers.JsonRpcProvider(url);
};

// Get provider for a specific chain
exports.getProvider = function(chainId) {
  if (!providers[chainId]) {
    throw new Error(`No provider set for chain ID ${chainId}`);
  }
  return providers[chainId];
};

// Get signer for a specific chain
exports.getSigner = function(chainId) {
  if (!privateKey) {
    throw new Error('Private key not set');
  }
  
  const provider = exports.getProvider(chainId);
  return new ethers.Wallet(privateKey, provider);
};

// Get contract instances for Uniswap V3
exports.getUniswapContracts = function(chainId, customAddresses = {}) {
  const provider = exports.getProvider(chainId);
  const signer = exports.getSigner(chainId);
  
  // Use custom addresses if provided, otherwise use defaults
  const addresses = {
    factory: customAddresses.factory || DEFAULT_CONTRACTS[chainId]?.factory,
    router: customAddresses.router || DEFAULT_CONTRACTS[chainId]?.router,
    nftManager: customAddresses.nftManager || DEFAULT_CONTRACTS[chainId]?.nftManager
  };
  
  if (!addresses.factory || !addresses.router || !addresses.nftManager) {
    throw new Error(`Missing contract addresses for chain ID ${chainId}`);
  }
  
  return {
    factory: new ethers.Contract(addresses.factory, FACTORY_ABI, signer),
    nftManager: new ethers.Contract(addresses.nftManager, NFT_MANAGER_ABI, signer)
  };
};

// Get ERC20 token contract
exports.getTokenContract = function(tokenAddress, chainId) {
  const signer = exports.getSigner(chainId);
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
};

// Approve token spending
exports.approveToken = async function(tokenAddress, spenderAddress, amount, chainId) {
  const tokenContract = exports.getTokenContract(tokenAddress, chainId);
  const tx = await tokenContract.approve(spenderAddress, amount);
  return await tx.wait();
};

// Check if token is approved
exports.isTokenApproved = async function(tokenAddress, ownerAddress, spenderAddress, amount, chainId) {
  const tokenContract = exports.getTokenContract(tokenAddress, chainId);
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
  return allowance.gte(amount);
};

// Get token balance
exports.getTokenBalance = async function(tokenAddress, ownerAddress, chainId) {
  const tokenContract = exports.getTokenContract(tokenAddress, chainId);
  return await tokenContract.balanceOf(ownerAddress);
};

// Convert token amount to wei
exports.toWei = async function(tokenAddress, amount, chainId) {
  if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    // ETH has 18 decimals
    return ethers.utils.parseEther(amount.toString());
  }
  
  const tokenContract = exports.getTokenContract(tokenAddress, chainId);
  const decimals = await tokenContract.decimals();
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

// Calculate price range for position
exports.calculatePriceRange = function(currentPrice, rangeWidth) {
  // Simple implementation - in a real scenario, you'd use more sophisticated calculations
  const lowerPrice = currentPrice.mul(ethers.BigNumber.from(100).sub(rangeWidth)).div(100);
  const upperPrice = currentPrice.mul(ethers.BigNumber.from(100).add(rangeWidth)).div(100);
  return { lowerPrice, upperPrice };
};

// Calculate deadline timestamp
exports.getDeadline = function(minutes = 20) {
  return Math.floor(Date.now() / 1000) + minutes * 60;
};