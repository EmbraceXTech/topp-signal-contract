// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRandomOracle.sol";
import "../interfaces/IRandomOracleCaller.sol";

// Disclaimer: this contract is for demonstration purposes only. In production, randomness should come from a decentralized oracle.

contract SimpleRandomOracle is IRandomOracle {
    IRandomOracleCaller public caller;
    mapping(uint => uint[]) public randomness;

    event RandomnessRequested(uint time, uint amount);
    event RandomnessUpdated(uint timestamp, uint[] randomness);

    function requestRandomness(uint time, uint amount) external override {
        require(caller == IRandomOracleCaller(msg.sender), "Unauthorized");
        emit RandomnessRequested(time, amount);
    }

    function fulfillRandomness(uint time, uint[] calldata _randomness) external {
        randomness[time] = _randomness;
        IRandomOracleCaller(caller).fulfillRandomness(time, _randomness);
        emit RandomnessUpdated(time, _randomness);
    }

    function setCaller(address _caller) external {
        caller = IRandomOracleCaller(_caller);
    }
}
