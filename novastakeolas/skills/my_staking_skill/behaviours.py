import os
import json
import subprocess
from pathlib import Path
from aea.skills.behaviours import TickerBehaviour

class StakingBehaviour(TickerBehaviour):
    def setup(self) -> None:
        # Get chain selection from environment
        self.target_chain = os.getenv("TARGET_CHAIN", "ETHEREUM")
        self.chain_id = int(os.getenv("CHAIN_ID", "1"))
        
        # Get RPC URL based on selected chain
        self.rpc_url = os.getenv(f"{self.target_chain}_RPC_URL")
        
        # Get Uniswap contract addresses based on selected chain
        self.uniswap_factory = os.getenv(f"{self.target_chain}_UNISWAP_FACTORY_ADDRESS")
        self.uniswap_router = os.getenv(f"{self.target_chain}_UNISWAP_ROUTER_ADDRESS")
        self.uniswap_nft_manager = os.getenv(f"{self.target_chain}_UNISWAP_NFT_MANAGER_ADDRESS")
        
        # Other environment variables
        self.private_key = os.getenv("PRIVATE_KEY")
        self.autostake = os.getenv("AUTOSTAKE", "false").lower() == "true"
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
        self.tick_interval = 3600  # 1 hour
        
        # Access staking_config from behaviour args
        self.config = self.params.get("staking_config", {})
        
        # Get the scripts directory path
        self.scripts_dir = Path(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))) / "scripts"
        
        print(f"Staking agent initialized. Chain: {self.target_chain} (ID: {self.chain_id}), Autostake: {self.autostake}")
        if self.debug:
            print(f"Scripts directory: {self.scripts_dir}")
            print(f"RPC URL: {self.rpc_url}")
            print(f"Staking config: {self.config}")
            print(f"Uniswap contracts: Factory={self.uniswap_factory}, Router={self.uniswap_router}, NFT Manager={self.uniswap_nft_manager}")

    def act(self) -> None:
        if self.autostake:
            # Update config with chain_id from environment
            config = dict(self.config)
            config["chain_id"] = self.chain_id
            
            result = self.create_position(**config)
            print(f"Autostake executed with result: {result}")

    def _run_js(self, command, args):
        """Run a Node.js script with the given arguments."""
        script_path = self.scripts_dir / f"{command}.js"
        
        if not script_path.exists():
            print(f"Script not found: {script_path}")
            return {"success": False, "error": f"Script not found: {script_path}"}
        
        # Make script executable
        os.chmod(script_path, 0o755)
        
        # Extract values from args dictionary and convert to list of strings
        arg_values = [str(value) for value in args.values()]
        
        cmd = ["node", str(script_path)] + arg_values
        
        if self.debug:
            print(f"Running command: {' '.join(cmd)}")
        
        try:
            env = os.environ.copy()
            # Ensure chain-specific variables are passed to the script
            env["RPC_URL"] = self.rpc_url
            env["CHAIN_ID"] = str(self.chain_id)
            
            # Ensure Uniswap contract addresses are passed to the script
            if self.uniswap_factory:
                env["UNISWAP_FACTORY_ADDRESS"] = self.uniswap_factory
            if self.uniswap_router:
                env["UNISWAP_ROUTER_ADDRESS"] = self.uniswap_router
            if self.uniswap_nft_manager:
                env["UNISWAP_NFT_MANAGER_ADDRESS"] = self.uniswap_nft_manager
                
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                env=env,
                cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            )
            
            if self.debug:
                print(f"Command output: {result.stdout}")
                if result.stderr:
                    print(f"Command error: {result.stderr}")
            
            try:
                return json.loads(result.stdout)
            except json.JSONDecodeError:
                return {
                    "success": False, 
                    "error": "Failed to parse JSON output", 
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
                
        except Exception as e:
            print(f"Error running script: {e}")
            return {"success": False, "error": str(e)}

    def create_position(self, token0, token1, fee, amount0, amount1, slippage, chain_id):
        return self._run_js("create_position", locals())

    def add_liquidity(self, token_id, amount0, amount1, slippage, chain_id):
        return self._run_js("add_liquidity", locals())

    def remove_liquidity(self, token_id, percent, slippage, chain_id):
        return self._run_js("remove_liquidity", locals())

    def collect_fees(self, token_id, chain_id):
        return self._run_js("collect_fees", locals())

    def close_position(self, token_id, slippage, chain_id):
        return self._run_js("close_position", locals())