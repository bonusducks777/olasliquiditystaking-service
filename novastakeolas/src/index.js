const { ethers } = require('ethers');
const { 
  ChainId, 
  FEE_TIERS, 
  TOKENS, 
  DEFAULT_CONTRACTS 
} = require('./constants');
const { 
  setPrivateKey, 
  setRpcUrl, 
  getProvider, 
  getSigner, 
  getUniswapContracts, 
  getTokenContract, 
  approveToken, 
  isTokenApproved, 
  getTokenBalance, 
  toWei, 
  calculatePriceRange, 
  getDeadline 
} = require('./utils');

// Export constants
exports.ChainId = ChainId;
exports.FEE_TIERS = FEE_TIERS;
exports.TOKENS = TOKENS;
exports.DEFAULT_CONTRACTS = DEFAULT_CONTRACTS;

// Export utility functions
exports.setPrivateKey = setPrivateKey;
exports.setRpcUrl = setRpcUrl;

// Create a new position
exports.createPosition = async function(token0, token1, fee, amount0, amount1, slippage, chainId, contractAddresses = {}) {
  try {
    const signer = getSigner(chainId);
    const signerAddress = await signer.getAddress();
    const { nftManager } = getUniswapContracts(chainId, contractAddresses);
    
    // Convert amounts to wei
    const amount0Wei = await toWei(token0.address, amount0, chainId);
    const amount1Wei = await toWei(token1.address, amount1, chainId);
    
    // Calculate minimum amounts based on slippage
    const slippageFactor = ethers.BigNumber.from(10000 - slippage).div(10000);
    const amount0Min = amount0Wei.mul(slippageFactor);
    const amount1Min = amount1Wei.mul(slippageFactor);
    
    // Approve tokens if needed
    if (token0.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      const isApproved = await isTokenApproved(
        token0.address, 
        signerAddress, 
        nftManager.address, 
        amount0Wei, 
        chainId
      );
      
      if (!isApproved) {
        await approveToken(token0.address, nftManager.address, amount0Wei, chainId);
      }
    }
    
    if (token1.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      const isApproved = await isTokenApproved(
        token1.address, 
        signerAddress, 
        nftManager.address, 
        amount1Wei, 
        chainId
      );
      
      if (!isApproved) {
        await approveToken(token1.address, nftManager.address, amount1Wei, chainId);
      }
    }
    
    // For simplicity, we're using a wide price range
    // In a real implementation, you'd calculate this more precisely
    const tickLower = -887220;  // Min tick
    const tickUpper = 887220;   // Max tick
    
    // Create the position
    const mintParams = {
      token0: token0.address,
      token1: token1.address,
      fee: fee,
      tickLower: tickLower,
      tickUpper: tickUpper,
      amount0Desired: amount0Wei,
      amount1Desired: amount1Wei,
      amount0Min: amount0Min,
      amount1Min: amount1Min,
      recipient: signerAddress,
      deadline: getDeadline()
    };
    
    const tx = await nftManager.mint(mintParams, { 
      value: token0.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? amount0Wei : 
             token1.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? amount1Wei : 0 
    });
    
    const receipt = await tx.wait();
    
    // Parse logs to get the token ID
    const transferEvent = receipt.events.find(event => 
      event.topics[0] === ethers.utils.id('Transfer(address,address,uint256)')
    );
    
    if (!transferEvent) {
      throw new Error('Could not find Transfer event in transaction receipt');
    }
    
    const tokenId = ethers.BigNumber.from(transferEvent.topics[3]).toNumber();
    return tokenId;
  } catch (error) {
    console.error('Error creating position:', error);
    throw error;
  }
};

// Add liquidity to an existing position
exports.addLiquidity = async function(tokenId, amount0, amount1, slippage, chainId, contractAddresses = {}) {
  try {
    const signer = getSigner(chainId);
    const signerAddress = await signer.getAddress();
    const { nftManager } = getUniswapContracts(chainId, contractAddresses);
    
    // Get position details
    const position = await nftManager.positions(tokenId);
    
    // Convert amounts to wei
    const amount0Wei = await toWei(position.token0, amount0, chainId);
    const amount1Wei = await toWei(position.token1, amount1, chainId);
    
    // Calculate minimum amounts based on slippage
    const slippageFactor = ethers.BigNumber.from(10000 - slippage).div(10000);
    const amount0Min = amount0Wei.mul(slippageFactor);
    const amount1Min = amount1Wei.mul(slippageFactor);
    
    // Approve tokens if needed
    if (position.token0 !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      const isApproved = await isTokenApproved(
        position.token0, 
        signerAddress, 
        nftManager.address, 
        amount0Wei, 
        chainId
      );
      
      if (!isApproved) {
        await approveToken(position.token0, nftManager.address, amount0Wei, chainId);
      }
    }
    
    if (position.token1 !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      const isApproved = await isTokenApproved(
        position.token1, 
        signerAddress, 
        nftManager.address, 
        amount1Wei, 
        chainId
      );
      
      if (!isApproved) {
        await approveToken(position.token1, nftManager.address, amount1Wei, chainId);
      }
    }
    
    // Add liquidity
    const increaseLiquidityParams = {
      tokenId: tokenId,
      amount0Desired: amount0Wei,
      amount1Desired: amount1Wei,
      amount0Min: amount0Min,
      amount1Min: amount1Min,
      deadline: getDeadline()
    };
    
    const tx = await nftManager.increaseLiquidity(increaseLiquidityParams, { 
      value: position.token0 === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? amount0Wei : 
             position.token1 === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? amount1Wei : 0 
    });
    
    return await tx.wait();
  } catch (error) {
    console.error('Error adding liquidity:', error);
    throw error;
  }
};

// Remove liquidity from a position
exports.removeLiquidity = async function(tokenId, percent, slippage, chainId, contractAddresses = {}) {
  try {
    const { nftManager } = getUniswapContracts(chainId, contractAddresses);
    
    // Get position details
    const position = await nftManager.positions(tokenId);
    
    // Calculate liquidity to remove
    const liquidityToRemove = position.liquidity.mul(ethers.BigNumber.from(percent)).div(100);
    
    // For simplicity, we're setting minimum amounts to 0
    // In a real implementation, you'd calculate this more precisely based on slippage
    const amount0Min = 0;
    const amount1Min = 0;
    
    // Remove liquidity
    const decreaseLiquidityParams = {
      tokenId: tokenId,
      liquidity: liquidityToRemove,
      amount0Min: amount0Min,
      amount1Min: amount1Min,
      deadline: getDeadline()
    };
    
    const tx = await nftManager.decreaseLiquidity(decreaseLiquidityParams);
    return await tx.wait();
  } catch (error) {
    console.error('Error removing liquidity:', error);
    throw error;
  }
};

// Collect fees from a position
exports.collectFees = async function(tokenId, chainId, contractAddresses = {}) {
  try {
    const signer = getSigner(chainId);
    const signerAddress = await signer.getAddress();
    const { nftManager } = getUniswapContracts(chainId, contractAddresses);
    
    // Collect all available fees
    const collectParams = {
      tokenId: tokenId,
      recipient: signerAddress,
      amount0Max: ethers.constants.MaxUint128,
      amount1Max: ethers.constants.MaxUint128
    };
    
    const tx = await nftManager.collect(collectParams);
    return await tx.wait();
  } catch (error) {
    console.error('Error collecting fees:', error);
    throw error;
  }
};

// Close a position
exports.closePosition = async function(tokenId, slippage, chainId, contractAddresses = {}) {
  try {
    const { nftManager } = getUniswapContracts(chainId, contractAddresses);
    
    // First remove all liquidity
    await exports.removeLiquidity(tokenId, 100, slippage, chainId, contractAddresses);
    
    // Then collect all fees
    await exports.collectFees(tokenId, chainId, contractAddresses);
    
    // Finally burn the position
    const tx = await nftManager.burn(tokenId);
    return await tx.wait();
  } catch (error) {
    console.error('Error closing position:', error);
    throw error;
  }
};

// Get all position IDs for the current user
exports.getPositionIds = async function(chainId, contractAddresses = {}) {
  try {
    // This is a simplified implementation
    // In a real scenario, you'd need to query events or use a subgraph
    return [123, 456]; // Placeholder
  } catch (error) {
    console.error('Error getting position IDs:', error);
    throw error;
  }
};

// Get information about a position
exports.getPositionInfo = async function(tokenId, chainId, contractAddresses = {}) {
  try {
    const { nftManager } = getUniswapContracts(chainId, contractAddresses);
    
    // Get position details
    const position = await nftManager.positions(tokenId);
    
    return {
      tokenId: tokenId,
      token0: position.token0,
      token1: position.token1,
      fee: position.fee,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      liquidity: position.liquidity,
      feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
      feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
      tokensOwed0: position.tokensOwed0,
      tokensOwed1: position.tokensOwed1
    };
  } catch (error) {
    console.error('Error getting position info:', error);
    throw error;
  }
};