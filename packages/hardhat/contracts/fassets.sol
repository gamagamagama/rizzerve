//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./YourContract.sol";

/// @title Rizz Token - An ERC20 token with configurable supply
/// @author Matus Gavornik
/// @notice This contract creates an ERC20 token with supply based on parameters
/// @dev Supply is calculated as number * multiplicator * 10^18
contract Rizz is ERC20{
    uint private constant _decimals = 18;
    constructor(uint256 number, uint256 multiplicator) ERC20("RizzToken", "RIZZ") {
        uint256 totalSupply = CalculateTotalSuply(number, multiplicator);
        _mint(msg.sender, totalSupply);
    }

    function owner() public view returns (address) {
        return address(this);
    }

    modifier isOwner() {
        require(msg.sender == owner(), "Not the Owner");
        _;
    }

    function CalculateTotalSuply(uint256 number, uint256 multiplicator) internal pure returns (uint256) {
        uint256 rawSupply = number * multiplicator;
        uint256 totalSupply = rawSupply * 10**_decimals;
        return totalSupply;
    }
    
    function decimals() public view virtual override returns (uint8) {
        return uint8(_decimals);
    }

    function mint(address to, uint256 amount) public isOwner {
        _mint(to, amount);
    }

}