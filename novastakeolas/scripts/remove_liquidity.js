#!/usr/bin/env node
const { 
    removeLiquidity, 
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
  const tokenId = Number(process.argv[2]);
  const percent = Number(process.argv[3]);
  const slippage = Number(process.argv[4]);
  const chainId = Number(process.argv[5]);
  
  if (debug) {
    console.log(`Removing ${percent}% liquidity from position ${tokenId}`);
    console.log(`Using Uniswap contracts: Factory=${uniswapFactoryAddress}, Router=${uniswapRouterAddress}, NFT Manager=${uniswapNFTManagerAddress}`);
  }
  
  // Set Uniswap contract addresses if provided
  const contractAddresses = {};
  if (uniswapFactoryAddress) contractAddresses.factory = uniswapFactoryAddress;
  if (uniswapRouterAddress) contractAddresses.router = uniswapRouterAddress;
  if (uniswapNFTManagerAddress) contractAddresses.nftManager = uniswapNFTManagerAddress;
  
  removeLiquidity(
    tokenId, 
    percent, 
    slippage, 
    chainId,
    contractAddresses
  )
    .then((receipt) => {
      console.log(JSON.stringify({ 
        success: true, 
        transactionHash: receipt.transactionHash 
      }));
      process.exit(0);
    })
    .catch((err) => {
      console.error(JSON.stringify({ success: false, error: err.message }));
      process.exit(1);
    });