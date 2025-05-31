// //SPDX-License-Identifier: MIT
// pragma solidity >=0.8.0 <0.9.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./YourContract.sol";

// /// @title Rizz Token - An ERC20 token with configurable supply
// /// @author Matus Gavornik
// /// @notice This contract creates an ERC20 token easier version

// contract RizzToken is ERC20, Ownable {
//     constructor (uint256 InitialSupply) ERC20("RizzToken", "RIZZ") Ownable(msg.sender) {
//         _mint(msg.sender, InitialSupply);
//     }

//     function mint(address account, uint256 amount) public {
//         _mint(account, amount);
//     }
// }
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourContract.sol";


contract RizzToken is ERC20, Ownable {
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor(uint256 initialSupply) ERC20("RizzToken", "RIZZ") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**decimals());
        // Make the deployer a minter by default
        minters[msg.sender] = true;
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    function mint(address to, uint256 amount) public onlyMinter {
        _mint(to, amount);
    }
    
    function addMinter(address minter) public onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) public onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function isMinter(address account) public view returns (bool) {
        return minters[account] || account == owner();
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}

