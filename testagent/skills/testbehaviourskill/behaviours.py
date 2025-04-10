import os
import json
from aea.protocols.base import Message
from aea.skills.base import Behaviour

class MyScaffoldBehaviour(Behaviour):
    """Test behaviour to send commands to the staking agent."""

    def setup(self) -> None:
        """Set up the behaviour."""
        self.tick_interval = 60  # Send a message every minute
        self.chain_id = int(os.getenv("CHAIN_ID", "1"))
        print(f"Test behaviour initialized for chain ID: {self.chain_id}")
        
    def act(self) -> None:
        """Execute the behaviour."""
        # Example message to create a position
        msg = {
            "command": "create-position",
            "args": {
                "token0": "WETH",
                "token1": "USDC",
                "fee": 3000,
                "amount0": 0.1,
                "amount1": 100,
                "slippage": 50,
                "chain_id": self.chain_id  # Use chain ID from environment
            }
        }
        
        # Send the message to the staking agent
        self._send_message("my_staking_agent", msg)
        print(f"Sent create-position message to staking agent for chain ID: {self.chain_id}")
    
    def _send_message(self, to: str, data: dict) -> None:
        """Send a message to another agent.
        
        Args:
            to: The recipient address
            data: The data to send
        """
        self.context.outbox.put_message(
            message=Message(
                performative=Message.Performative.INFORM,
                content=json.dumps(data),
                dialogue_reference=("", ""),
                message_id=1,
                target=0,
            ),
            sender=self.context.agent_address,
            to=to,
            protocol_id="fetchai/default:1.0.0",
        )