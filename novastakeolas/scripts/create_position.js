#!/usr/bin/env node
const { 
    createPosition, 
    TOKENS, 
    FEE_TIERS, 
    ChainId, 
    setPrivateKey, 
    setRpcUrl 
  } = require("../src");
  
  // Get environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;
  const debug = process.env.DEBUG === "true";
  const uniswapFactoryAddress = process.env.UNISWAP_FACTORY_ADDRESS;
  const uniswapRouterAddress = process.env.UNISWAP_ROUTER_ADDRESS;
  const uniswapNFTManagerAddress = process.env.UNISWAP_NFT_MANAGER_ADDRESS;
  
  if (privateKey) {
    setPrivateKey(privateKey);
  }
  
  if (rpcUrl) {
    setRpcUrl(ChainId.ETHEREUM, rpcUrl);
  }
  
  // Get arguments from command line
  const token0Symbol = process.argv[2];
  const token1Symbol = process.argv[3];
  const fee = Number(process.argv[4]);
  const amount0 = Number(process.argv[5]);
  const amount1 = Number(process.argv[6]);
  const slippage = Number(process.argv[7]);
  const chainId = Number(process.argv[8]);
  
  if (debug) {
    console.log(`Creating position with: ${token0Symbol}/${token1Symbol}, fee: ${fee}, amounts: ${amount0}/${amount1}`);
    console.log(`Using Uniswap contracts: Factory=${uniswapFactoryAddress}, Router=${uniswapRouterAddress}, NFT Manager=${uniswapNFTManagerAddress}`);
  }
  
  // Convert token symbols to actual token objects
  const chain = chainId;
  const token0 = TOKENS[chain][token0Symbol];
  const token1 = TOKENS[chain][token1Symbol];
  
  if (!token0 || !token1) {
    console.error(JSON.stringify({ 
      success: false, 
      error: `Token not found: ${!token0 ? token0Symbol : token1Symbol}` 
    }));
    process.exit(1);
  }
  
  // Set Uniswap contract addresses if provided
  const contractAddresses = {};
  if (uniswapFactoryAddress) contractAddresses.factory = uniswapFactoryAddress;
  if (uniswapRouterAddress) contractAddresses.router = uniswapRouterAddress;
  if (uniswapNFTManagerAddress) contractAddresses.nftManager = uniswapNFTManagerAddress;
  
  createPosition(
    token0, 
    token1, 
    Number(fee), 
    Number(amount0), 
    Number(amount1), 
    Number(slippage), 
    chain,
    contractAddresses
  )
    .then((tokenId) => {
      console.log(JSON.stringify({ success: true, tokenId }));
      process.exit(0);
    })
    .catch((err) => {
      console.error(JSON.stringify({ success: false, error: err.message }));
      process.exit(1);
    });