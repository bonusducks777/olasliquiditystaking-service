from aea.protocols.base import Message
from aea.skills.base import Handler
import json

class StakingHandler(Handler):
    # Use the full protocol ID format
    SUPPORTED_PROTOCOL = "fetchai/default:1.0.0"

    def setup(self) -> None:
        print("Staking handler initialized")
        self.behaviour = self.context.behaviours.staking_behaviour

    def handle(self, message: Message) -> None:
        """Handle incoming messages."""
        try:
            print(f"Received message from {message.sender}")
            payload = json.loads(message.content)
            command = payload.get("command")
            args = payload.get("args", {})
            
            print(f"Processing command: {command} with args: {args}")
            
            if command == "create-position":
                result = self.behaviour.create_position(**args)
            elif command == "add-liquidity":
                result = self.behaviour.add_liquidity(**args)
            elif command == "remove-liquidity":
                result = self.behaviour.remove_liquidity(**args)
            elif command == "collect-fees":
                result = self.behaviour.collect_fees(**args)
            elif command == "close-position":
                result = self.behaviour.close_position(**args)
            else:
                result = {"success": False, "error": f"Unknown command: {command}"}
                
            # Send response back
            self._send_response(message.sender, result)
            
        except json.JSONDecodeError:
            print(f"Failed to parse message content: {message.content}")
        except Exception as e:
            print(f"Error handling message: {str(e)}")
            self._send_response(message.sender, {"success": False, "error": str(e)})

    def _send_response(self, to, data):
        """Send a response back to the sender."""
        self.context.outbox.put_message(
            to=to,
            sender=self.context.agent_address,
            protocol_id=self.SUPPORTED_PROTOCOL,
            message=json.dumps(data)
        )

    def teardown(self) -> None:
        pass