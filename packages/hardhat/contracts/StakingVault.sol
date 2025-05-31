//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./MyToken.sol";

contract StakingVault {
    MyToken public token;

    struct Stake {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public timestamp;
    
    constructor (RizzToken _token){
        token = _token;
    }

    //staking function period, amount, locking/unlocking
    function stake(uint256 amount, uint256 period) external {
        require(amount > 0, "Cannot stake 0 tokens");
        require(period >= 6 months, "Locking time minimum 6 moths");

        Stake storage userStake = stakes[msg.sender];
        require(userStake amount == 0, "already staking");

        token.transferFrom(msg.sender, address(this), amount);
        userStake.amount = amount;
        userStake.unlockTime = block timestamp + lockTime;
    }

     //withdraw function with simulated reward
     function withdraw() external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No staked Rizz");
        require(block.timestamp >= userStake.unlockTime, "Rizz still locked");

        //simulation of 10% yield
        uint256 reward = (amount * 10) /100;
        token.transfer(msg.sender, amount + reward);

    //function getStake
    unction getStake(address user) external view returns (uint256 amount, uint256 unlockTime) {
        Stake storage s = stakes[user];
        return (s.amount, s.unlockTime);

}