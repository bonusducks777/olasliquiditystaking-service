# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2023
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
# ------------------------------------------------------------------------------

"""
This module contains the Uniswap V3 staking skill.

This skill enables agents to interact with Uniswap V3 pools to:
- Create liquidity positions
- Add liquidity to existing positions
- Remove liquidity from positions
- Collect fees from positions
- Close positions

The skill can be controlled via messages from other agents or operate autonomously
in auto-stake mode.
"""

from aea.configurations.base import PublicId

PUBLIC_ID = PublicId.from_str("your_name/my_staking_skill:0.1.0")