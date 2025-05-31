//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./YourContract.sol";

/// @title Rizz Token - An ERC20 token with configurable supply
/// @author Matus Gavornik
/// @notice This contract creates an ERC20 token easier version

contract RizzToken is ERC20 {
    constructor (uint256 InitialSupply) ERC20("RizzToken", "RIZZ") {
        _mint(msg.sender, InitialSupply);
    }
}
