# Uniswap V3 Staking Agent for Olas

A multi-chain staking bot for Uniswap V3 and its forks, implemented as an autonomous agent using the Olas/Open Autonomy framework.

## Overview

This project implements an autonomous agent for managing Uniswap V3 liquidity positions across multiple blockchains. The agent can:

- Create new liquidity positions
- Add liquidity to existing positions
- Remove liquidity from positions
- Collect fees from positions
- Close positions

## Architecture

The project consists of two main components:

1. Staking Agent: The main agent responsible for interacting with Uniswap V3 contracts.
2. Test Agent: A simple agent that sends test commands to the staking agent.

## Prerequisites

- Python 3.10+
- Node.js 16+
- npm
- Open Autonomy framework
- Ethereum wallet with funds for the target chain

## Installation

1. Install Open Autonomy:
   pip install open-autonomy

2. Clone the Repository:
   git clone https://github.com/yourusername/uniswap-staking-agent.git
   cd uniswap-staking-agent

3. Install Dependencies:
   pip install -r requirements.txt
   cd my_staking_agent
   npm install

4. Set Up the Agents:
   cd my_staking_agent
   autonomy add-component connection valory/abci:0.1.0
   autonomy add-component protocol valory/abci:0.1.0
   autonomy add-component protocol fetchai/default:1.0.0
   autonomy add-component skill valory/abstract_abci:0.1.0

## Configuration

Create a .env file in the my_staking_agent directory with:
- DEBUG=true
- PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
- AUTOSTAKE=false
- TARGET_CHAIN=ETHEREUM
- CHAIN_ID=1
- RPC endpoints for each chain
- Uniswap contract addresses

## Usage

1. Start the Staking Agent:
   cd my_workspace/my_staking_agent
   autonomy run

2. Start the Test Agent:
   cd my_workspace/test_agent
   autonomy run

## Available Commands

- create-position: Creates a new liquidity position
- add-liquidity: Adds liquidity to an existing position
- remove-liquidity: Removes liquidity from a position
- collect-fees: Collects fees from a position
- close-position: Closes a position

## Chain Selection

The agent supports multiple blockchains:
- ETHEREUM (Chain ID: 1)
- ARBITRUM (Chain ID: 42161)
- OPTIMISM (Chain ID: 10)
- POLYGON (Chain ID: 137)
- BASE (Chain ID: 8453)

## Troubleshooting

Common Issues:
- Missing ABCI Connection: Install with autonomy add-component connection valory/abci:0.1.0
- Invalid Agent Configuration: Check your aea-config.yaml file
- Node.js Errors: Run npm install in the my_staking_agent directory
- RPC Errors: Check your RPC URL in the .env file

## License

This project is licensed under the Apache License 2.0.
