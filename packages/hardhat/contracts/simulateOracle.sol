// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockPriceOracle
 * @dev A simple mock price oracle for testing the RizzToken stabilization
 * In production, you would integrate with Chainlink, Uniswap TWAP, or other real oracles
 */
contract MockPriceOracle is Ownable {
    uint256 private currentPrice;
    uint256 public lastUpdateTime;
    
    // Events
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    
    /**
     * @dev Constructor sets initial price
     */
    constructor() Ownable(msg.sender) {
        currentPrice = 1e18; // Start at 1.0 (18 decimals)
        lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Get the current price
     * @return The current price with 18 decimals
     */
    function getPrice() external view returns (uint256) {
        return currentPrice;
    }
    
    /**
     * @dev Update the price (in a real oracle, this would fetch from external sources)
     * For testing, this adds some simulated volatility
     */
    function updatePrice() external {
        // Simple mock: add some pseudo-random volatility based on block data
        uint256 pseudoRandom = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            currentPrice
        ))) % 2000; // 0-1999
        
        // Convert to percentage change: -10% to +10%
        int256 percentChange = int256(pseudoRandom) - 1000; // -1000 to +999
        
        // Apply the change
        if (percentChange >= 0) {
            currentPrice = currentPrice + (currentPrice * uint256(percentChange)) / 10000;
        } else {
            uint256 decrease = (currentPrice * uint256(-percentChange)) / 10000;
            currentPrice = currentPrice > decrease ? currentPrice - decrease : currentPrice / 2;
        }
        
        lastUpdateTime = block.timestamp;
        emit PriceUpdated(currentPrice, lastUpdateTime);
    }
    
    /**
     * @dev Manually set price (only owner, for testing purposes)
     * @param newPrice The new price to set
     */
    function setPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be positive");
        currentPrice = newPrice;
        lastUpdateTime = block.timestamp;
        emit PriceUpdated(currentPrice, lastUpdateTime);
    }
    
    /**
     * @dev Simulate price volatility for testing
     * @param volatilityPercent The volatility percentage (e.g., 500 = 5%)
     */
    function simulateVolatility(uint256 volatilityPercent) external onlyOwner {
        require(volatilityPercent <= 5000, "Max 50% volatility"); // Reasonable limit
        
        uint256 change = (currentPrice * volatilityPercent) / 10000;
        
        // Randomly increase or decrease
        if (block.timestamp % 2 == 0) {
            currentPrice += change;
        } else {
            currentPrice = currentPrice > change ? currentPrice - change : currentPrice / 2;
        }
        
        lastUpdateTime = block.timestamp;
        emit PriceUpdated(currentPrice, lastUpdateTime);
    }
    
    /**
     * @dev Get price history info
     */
    function getPriceInfo() external view returns (uint256 price, uint256 updateTime) {
        return (currentPrice, lastUpdateTime);
    }
}