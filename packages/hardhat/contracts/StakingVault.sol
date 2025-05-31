//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./MyToken.sol";

contract StakingVault {
    MyToken public token;

    struct Stake {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => Stake) public stakes;
    constructor (RizzToken _token){
        token = _token;
    }

    //TODO:
    //staking function period, amount, locking/unlocking
    //withdraw function with simulated reward
        //simulation of 10% yield
    //function getStake

}