#!/usr/bin/env node
const { 
    getPositionIds, 
    ChainId, 
    setPrivateKey, 
    setRpcUrl 
  } = require("../src");
  
  // Get environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;
  const debug = process.env.DEBUG === "true";
  
  if (privateKey) {
    setPrivateKey(privateKey);
  }
  
  if (rpcUrl) {
    setRpcUrl(ChainId.ETHEREUM, rpcUrl);
  }
  
  const args = process.argv.slice(2);
  const [chainId] = args;
  
  if (debug) {
    console.log(`Getting position IDs for chain ${chainId}`);
  }
  
  getPositionIds(Number(chainId))
    .then((positionIds) => {
      console.log(JSON.stringify({ success: true, positionIds }));
      process.exit(0);
    })
    .catch((err) => {
      console.error(JSON.stringify({ success: false, error: err.message }));
      process.exit(1);
    });