// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/ISignalTicket.sol";
import "./interfaces/IToppSignalPool.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/IRandomOracle.sol";

contract ToppSignalPool is IToppSignalPool {
    
    IPriceOracle public priceOracle;
    IRandomOracle public randomOracle;

    IERC20 public currency;
    ISignalTicket public ticket;

    modifier onlyPriceOracle() {
        require(msg.sender == address(priceOracle), "ONLY_PRICE_ORACLE");
        _;
    }

    modifier onlyRandomOracle() {
        require(msg.sender == address(randomOracle), "ONLY_RANDOM_ORACLE");
        _;
    }

    constructor(
        address _currency,
        address _ticket,
        address _priceOracle,
        address _randomOracle
    ) {
        currency = IERC20(_currency);
        priceOracle = IPriceOracle(_priceOracle);
        randomOracle = IRandomOracle(_randomOracle);
        ticket = ISignalTicket(_ticket);
    }

    // User called functions
    function _placeBid(uint time, uint price, uint amount, address sender) internal {
        
    }

    function _settle(uint time, address sender) internal {

    }

    function _collectReserve(uint time, address sender) external {

    }

    function _collectFee(uint time, address sender) external {

    }

    function _claimPrizes(uint time, uint price, uint amount, address sender) external {

    }

    // Contract called functions
    function fulfillPrice(uint time, uint price) external onlyPriceOracle {

    }

    function fulfillRandom(uint time, uint[] calldata values) external onlyRandomOracle {

    }
}
