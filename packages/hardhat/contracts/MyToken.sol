

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./YourContract.sol";

interface IPriceOracle {
    function getPrice() external view returns (uint256);
    function updatePrice() external;
}

/**
 * @title RizzToken with Volatility Stabilization
 * @dev ERC20 Token with minting functionality and automatic volatility stabilization
 * Combines the original RizzToken features with volatility stabilization mechanisms
 */
contract RizzToken is ERC20, Ownable, ReentrancyGuard {
    // Original RizzToken functionality
    mapping(address => bool) public minters;
    
    // Volatility stabilization components
    IPriceOracle public priceOracle;
    
    // Stabilization parameters
    uint256 public constant VOLATILITY_THRESHOLD = 1500; // 15% in basis points
    uint256 public constant MAX_SUPPLY_ADJUSTMENT = 500; // 5% max adjustment per cycle
    uint256 public constant PRICE_SMOOTHING_WINDOW = 24 hours;
    uint256 public constant STABILIZATION_COOLDOWN = 6 hours;
    
    // Price tracking
    struct PricePoint {
        uint256 price;
        uint256 timestamp;
    }
    
    PricePoint[] public priceHistory;
    uint256 public lastStabilizationTime;
    uint256 public baselinePrice;
    uint256 public smoothedPrice;
    
    // Stabilization reserves
    uint256 public stabilizationReserve;
    mapping(address => uint256) public stakerBalances;
    uint256 public totalStaked;
    
    // Volatility metrics
    uint256 public volatilityIndex;
    uint256 public constant VOLATILITY_DECAY = 9500; // 95% decay per day
    
    // Stabilization control
    bool public stabilizationEnabled = true;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event PriceUpdated(uint256 newPrice, uint256 volatility);
    event VolatilityStabilization(bool isMinting, uint256 amount, uint256 newSupply);
    event StabilizationReserveUpdated(uint256 newReserve);
    event StabilizationToggled(bool enabled);
    
    /**
     * @dev Constructor that initializes both token and stabilization features
     * @param initialOwner The address that will own the contract
     * @param _priceOracle Address of the price oracle contract
     */
    constructor(
        address initialOwner,
        address _priceOracle
    ) ERC20("RizzToken", "RIZZ") Ownable(initialOwner) {
        // Grant the owner minter role by default
        minters[initialOwner] = true;
        emit MinterAdded(initialOwner);
        
        // Initialize stabilization parameters
        priceOracle = IPriceOracle(_priceOracle);
        baselinePrice = 1e18; // Initial baseline price
        smoothedPrice = baselinePrice;
        lastStabilizationTime = block.timestamp;
    }
    
    // ================== ORIGINAL RIZZ TOKEN FUNCTIONALITY ==================
    
    /**
     * @dev Modifier to check if the caller is a minter
     */
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    /**
     * @dev Check if an address is authorized to mint tokens
     */
    function isMinter(address account) public view returns (bool) {
        return minters[account] || account == owner();
    }
    
    /**
     * @dev Add a new minter (only owner can do this)
     */
    function addMinter(address minter) public onlyOwner {
        require(minter != address(0), "Cannot add zero address as minter");
        require(!minters[minter], "Address is already a minter");
        
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter (only owner can do this)
     */
    function removeMinter(address minter) public onlyOwner {
        require(minters[minter], "Address is not a minter");
        require(minter != owner(), "Cannot remove owner from minters");
        
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint tokens manually (original functionality)
     */
    function mint(address to, uint256 amount) public onlyMinter returns (bool) {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        return true;
    }
    
    /**
     * @dev Batch mint tokens to multiple addresses
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
     */
    function burn(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
    }
    
    // ================== VOLATILITY STABILIZATION FUNCTIONALITY ==================
    
    /**
     * @dev Modifier to ensure stabilization cooldown period has passed
     */
    modifier onlyDuringStabilization() {
        require(
            block.timestamp >= lastStabilizationTime + STABILIZATION_COOLDOWN,
            "Stabilization cooldown active"
        );
        _;
    }
    
    /**
     * @dev Main stabilization function - updates price and performs stabilization if needed
     */
    function updateAndStabilize() external onlyDuringStabilization {
        require(stabilizationEnabled, "Stabilization is disabled");
        
        priceOracle.updatePrice();
        uint256 currentPrice = priceOracle.getPrice();
        
        _updatePriceHistory(currentPrice);
        _updateVolatilityIndex();
        _updateSmoothedPrice();
        
        if (_shouldStabilize()) {
            _performStabilization(currentPrice);
        }
        
        emit PriceUpdated(currentPrice, volatilityIndex);
    }
    
    /**
     * @dev Check if stabilization should be performed
     */
    function _shouldStabilize() internal view returns (bool) {
        if (priceHistory.length < 2) return false;
        
        uint256 currentPrice = priceHistory[priceHistory.length - 1].price;
        uint256 priceDeviation = _calculatePriceDeviation(currentPrice, smoothedPrice);
        
        return priceDeviation > VOLATILITY_THRESHOLD && volatilityIndex > VOLATILITY_THRESHOLD;
    }
    
    /**
     * @dev Perform automatic minting or burning based on price movement
     */
    function _performStabilization(uint256 currentPrice) internal {
        uint256 currentSupply = totalSupply();
        uint256 adjustmentAmount = 0;
        bool shouldMint = false;
        
        if (currentPrice > smoothedPrice) {
            // Price too high - mint tokens to increase supply and lower price
            uint256 priceRatio = (currentPrice * 10000) / smoothedPrice;
            if (priceRatio > 11000) { // More than 10% above smoothed price
                adjustmentAmount = (currentSupply * (priceRatio - 10000)) / 50000; // Conservative adjustment
                shouldMint = true;
            }
        } else {
            // Price too low - burn tokens to decrease supply and raise price
            uint256 priceRatio = (smoothedPrice * 10000) / currentPrice;
            if (priceRatio > 11000) { // More than 10% below smoothed price
                adjustmentAmount = (currentSupply * (priceRatio - 10000)) / 50000; // Conservative adjustment
                shouldMint = false;
            }
        }
        
        // Cap the adjustment amount to prevent extreme changes
        uint256 maxAdjustment = (currentSupply * MAX_SUPPLY_ADJUSTMENT) / 10000;
        if (adjustmentAmount > maxAdjustment) {
            adjustmentAmount = maxAdjustment;
        }
        
        if (adjustmentAmount > 0) {
            if (shouldMint) {
                _mint(address(this), adjustmentAmount);
                _distributeToStakers(adjustmentAmount);
            } else {
                _burnFromReserve(adjustmentAmount);
            }
            
            lastStabilizationTime = block.timestamp;
            emit VolatilityStabilization(shouldMint, adjustmentAmount, totalSupply());
        }
    }
    
    /**
     * @dev Burn tokens from stabilization reserve
     */
    function _burnFromReserve(uint256 amount) internal {
        uint256 availableToBurn = balanceOf(address(this));
        if (availableToBurn >= amount) {
            _burn(address(this), amount);
            stabilizationReserve -= amount;
        } else if (availableToBurn > 0) {
            _burn(address(this), availableToBurn);
            stabilizationReserve -= availableToBurn;
        }
    }
    
    /**
     * @dev Distribute minted tokens to stakers or add to reserve
     */
    function _distributeToStakers(uint256 amount) internal {
        stabilizationReserve += amount;
    }
    
    // ================== STAKING FUNCTIONALITY ==================
    
    /**
     * @dev Stake tokens to participate in stabilization rewards
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakerBalances[msg.sender] += amount;
        totalStaked += amount;
        stabilizationReserve += amount;
        
        emit StabilizationReserveUpdated(stabilizationReserve);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(stakerBalances[msg.sender] >= amount, "Insufficient staked balance");
        
        stakerBalances[msg.sender] -= amount;
        totalStaked -= amount;
        stabilizationReserve -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit StabilizationReserveUpdated(stabilizationReserve);
    }
    
    /**
     * @dev Calculate rewards for stakers from stabilization activities
     */
    function calculateStakerRewards(address staker) external view returns (uint256) {
        if (totalStaked == 0 || stakerBalances[staker] == 0) return 0;
        
        uint256 stakerShare = (stakerBalances[staker] * 10000) / totalStaked;
        uint256 availableRewards = stabilizationReserve > totalStaked ? 
                                   stabilizationReserve - totalStaked : 0;
        
        return (availableRewards * stakerShare) / 10000;
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external nonReentrant {
        uint256 rewards = this.calculateStakerRewards(msg.sender);
        require(rewards > 0, "No rewards available");
        
        stabilizationReserve -= rewards;
        _transfer(address(this), msg.sender, rewards);
    }
    
    // ================== PRICE TRACKING FUNCTIONS ==================
    
    /**
     * @dev Update price history with new price point
     */
    function _updatePriceHistory(uint256 newPrice) internal {
        priceHistory.push(PricePoint({
            price: newPrice,
            timestamp: block.timestamp
        }));
        
        // Keep only recent price history (last 7 days)
        while (priceHistory.length > 0 && 
               block.timestamp - priceHistory[0].timestamp > 7 days) {
            _removeFirstPricePoint();
        }
    }
    
    /**
     * @dev Remove oldest price point from history
     */
    function _removeFirstPricePoint() internal {
        for (uint256 i = 1; i < priceHistory.length; i++) {
            priceHistory[i - 1] = priceHistory[i];
        }
        priceHistory.pop();
    }
    
    /**
     * @dev Update volatility index based on recent price movements
     */
    function _updateVolatilityIndex() internal {
        if (priceHistory.length < 2) return;
        
        uint256 recentVolatility = _calculateRecentVolatility();
        
        // Decay existing volatility and add new volatility
        volatilityIndex = (volatilityIndex * VOLATILITY_DECAY) / 10000 + recentVolatility;
    }
    
    /**
     * @dev Calculate recent volatility based on price variance
     */
    function _calculateRecentVolatility() internal view returns (uint256) {
        if (priceHistory.length < 2) return 0;
        
        uint256 priceSum = 0;
        uint256 count = 0;
        uint256 cutoffTime = block.timestamp - PRICE_SMOOTHING_WINDOW;
        
        // Calculate average price in recent window
        for (uint256 i = priceHistory.length; i > 0; i--) {
            if (priceHistory[i - 1].timestamp < cutoffTime) break;
            priceSum += priceHistory[i - 1].price;
            count++;
        }
        
        if (count < 2) return 0;
        
        uint256 averagePrice = priceSum / count;
        uint256 varianceSum = 0;
        
        // Calculate variance
        for (uint256 i = priceHistory.length; i > 0; i--) {
            if (priceHistory[i - 1].timestamp < cutoffTime) break;
            uint256 diff = priceHistory[i - 1].price > averagePrice ? 
                          priceHistory[i - 1].price - averagePrice : 
                          averagePrice - priceHistory[i - 1].price;
            varianceSum += (diff * diff) / averagePrice;
        }
        
        return (varianceSum * 10000) / (count * averagePrice);
    }
    
    /**
     * @dev Update smoothed price using exponential moving average
     */
    function _updateSmoothedPrice() internal {
        if (priceHistory.length == 0) return;
        
        uint256 currentPrice = priceHistory[priceHistory.length - 1].price;
        uint256 alpha = 200; // 2% weight for new price (98% for existing smoothed price)
        
        smoothedPrice = (smoothedPrice * (10000 - alpha) + currentPrice * alpha) / 10000;
    }
    
    /**
     * @dev Calculate price deviation in basis points
     */
    function _calculatePriceDeviation(uint256 price1, uint256 price2) internal pure returns (uint256) {
        if (price2 == 0) return 0;
        
        uint256 diff = price1 > price2 ? price1 - price2 : price2 - price1;
        return (diff * 10000) / price2;
    }
    
    // ================== VIEW FUNCTIONS ==================
    
    /**
     * @dev Get current price from oracle
     */
    function getCurrentPrice() external view returns (uint256) {
        return priceOracle.getPrice();
    }
    
    /**
     * @dev Get complete price history
     */
    function getPriceHistory() external view returns (PricePoint[] memory) {
        return priceHistory;
    }
    
    /**
     * @dev Get current stabilization status
     */
    function getStabilizationStatus() external view returns (
        uint256 _volatilityIndex,
        uint256 _smoothedPrice,
        uint256 _lastStabilization,
        bool _canStabilize,
        bool _stabilizationEnabled
    ) {
        return (
            volatilityIndex,
            smoothedPrice,
            lastStabilizationTime,
            block.timestamp >= lastStabilizationTime + STABILIZATION_COOLDOWN,
            stabilizationEnabled
        );
    }
    
    /**
     * @dev Get staking information for an address
     */
    function getStakingInfo(address account) external view returns (
        uint256 stakedAmount,
        uint256 availableRewards,
        uint256 totalStakedInContract,
        uint256 reserveAmount
    ) {
        return (
            stakerBalances[account],
            this.calculateStakerRewards(account),
            totalStaked,
            stabilizationReserve
        );
    }
    
    // ================== ADMIN FUNCTIONS ==================
    
    /**
     * @dev Set new price oracle (only owner)
     */
    function setPriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        priceOracle = IPriceOracle(newOracle);
    }
    
    /**
     * @dev Toggle stabilization on/off (only owner)
     */
    function toggleStabilization() external onlyOwner {
        stabilizationEnabled = !stabilizationEnabled;
        emit StabilizationToggled(stabilizationEnabled);
    }
    
    /**
     * @dev Emergency withdraw from stabilization reserve (only owner)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= stabilizationReserve, "Insufficient reserve");
        stabilizationReserve -= amount;
        _transfer(address(this), owner(), amount);
    }
    
    /**
     * @dev Get all minter addresses (for compatibility with original)
     */
    function getAllMinters() public view returns (address[] memory) {
        // Simple implementation - in production you might maintain a separate array
        address[] memory allMinters = new address[](1);
        allMinters[0] = owner();
        return allMinters;
    }
}