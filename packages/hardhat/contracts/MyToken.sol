// // pragma solidity >=0.8.0 <0.9.0;

// // import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// // import "@openzeppelin/contracts/access/Ownable.sol";
// // import "./YourContract.sol";

// // /// @title Rizz Token - An ERC20 token with configurable supply
// // /// @author Matus Gavornik
// // /// @notice This contract creates an ERC20 token easier version

// // contract RizzToken is ERC20, Ownable {
// //     constructor (uint256 InitialSupply) ERC20("RizzToken", "RIZZ") Ownable(msg.sender) {
// //         _mint(msg.sender, InitialSupply);
// //     }

// //     function mint(address account, uint256 amount) public {
// //         _mint(account, amount);
// //     }
// // }

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./YourContract.sol";


// contract RizzToken is ERC20, Ownable {
//     mapping(address => bool) public minters;
    
//     event MinterAdded(address indexed minter);
//     event MinterRemoved(address indexed minter);
    
//     constructor(uint256 initialSupply) ERC20("RizzToken", "RIZZ") Ownable(msg.sender) {
//         _mint(msg.sender, initialSupply * 10**decimals());
//         // Make the deployer a minter by default
//         minters[msg.sender] = true;
//     }
    
//     modifier onlyMinter() {
//         require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
//         _;
//     }
    
//     function mint(address to, uint256 amount) public onlyMinter {
//         _mint(to, amount);
//     }
    
//     function addMinter(address minter) public onlyOwner {
//         minters[minter] = true;
//         emit MinterAdded(minter);
//     }
    
//     function removeMinter(address minter) public onlyOwner {
//         minters[minter] = false;
//         emit MinterRemoved(minter);
//     }
    
//     function isMinter(address account) public view returns (bool) {
//         return minters[account] || account == owner();
//     }
    
//     function burn(uint256 amount) public {
//         _burn(msg.sender, amount);
//     }
// }

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourContract.sol";

/**
 * @title RizzToken
 * @dev ERC20 Token with minting functionality
 * Compatible with the React TokenMinter component
 */
contract RizzToken is ERC20, Ownable {
    // Mapping to track authorized minters
    mapping(address => bool) public minters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    /**
     * @dev Constructor that gives the deployer initial ownership and minter role
     * @param initialOwner The address that will own the contract
     */
    constructor(address initialOwner) ERC20("RizzToken", "RIZZ") Ownable(initialOwner) {
        // Grant the owner minter role by default
        minters[initialOwner] = true;
        emit MinterAdded(initialOwner);
    }
    
    /**
     * @dev Modifier to check if the caller is a minter
     */
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    /**
     * @dev Check if an address is authorized to mint tokens
     * @param account The address to check
     * @return bool True if the address can mint tokens
     */
    function isMinter(address account) public view returns (bool) {
        return minters[account] || account == owner();
    }
    
    /**
     * @dev Add a new minter (only owner can do this)
     * @param minter The address to add as a minter
     */
    function addMinter(address minter) public onlyOwner {
        require(minter != address(0), "Cannot add zero address as minter");
        require(!minters[minter], "Address is already a minter");
        
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter (only owner can do this)
     * @param minter The address to remove from minters
     */
    function removeMinter(address minter) public onlyOwner {
        require(minters[minter], "Address is not a minter");
        require(minter != owner(), "Cannot remove owner from minters");
        
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint tokens to a specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in wei units)
     * @return bool True if the minting was successful
     */
    function mint(address to, uint256 amount) public onlyMinter returns (bool) {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        return true;
    }
    
    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint to each address
     */
    function batchMint(address[] memory recipients, uint256[] memory amounts) public onlyMinter {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            _mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Burn tokens from the caller's balance
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Get all minter addresses (view function for debugging)
     * Note: This is not gas-efficient for large numbers of minters
     */
    function getAllMinters() public view returns (address[] memory) {
        // This is a simple implementation for demonstration
        // In production, you might want to maintain a separate array
        address[] memory allMinters = new address[](1);
        allMinters[0] = owner();
        return allMinters;
    }
}