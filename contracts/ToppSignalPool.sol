// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "./interfaces/ISignalTicket.sol";
import "./interfaces/IToppSignalPool.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/IRandomOracle.sol";
import "./interfaces/IPriceOracleCaller.sol";
import "./interfaces/IRandomOracleCaller.sol";

import "./libraries/Sorter.sol";

abstract contract ToppSignalPool is IToppSignalPool, IPriceOracleCaller, IRandomOracleCaller {
     using Sorter for uint[];

    IPriceOracle public priceOracle;
    IRandomOracle public randomOracle;

    ISignalTicket public ticket;

    address public reservePool;
    address public feeCollector;

    mapping(uint => Status) public slotStatus;
    mapping(uint => uint) public slotReward;
    mapping(uint => uint[]) public slotPrices;
    mapping(uint => uint[]) public slotWeights;

    mapping(uint => uint) public settledExact;
    mapping(uint => uint[3]) public settledClosest;
    mapping(uint => uint[3]) public settledLucky;

    mapping(uint => uint) public settledExactWeight;
    mapping(uint => uint[3]) public settledClosestWeights;
    mapping(uint => uint[3]) public settledLuckyWeights;

    mapping(uint => bool) public priceOracleFulfilled;
    mapping(uint => bool) public randomOracleFulfilled;

    mapping(uint => uint[]) public randomOracleResults;

    uint public maxTicketPerSlot;
    uint public ticketPrice;

    uint public TOTAL_POOL_PORTION = 10000; // 1.0000
    uint public EXACT_POOL_PORTION = 5000; // 0.5000
    uint[3] public PROXIMITY_POOL_PORTIONS = [1500, 700, 300]; // 0.1500, 0.0700, 0.0300
    uint[3] public FORTUNE_POOL_PORTIONS = [500, 300, 200]; // 0.0500, 0.0300, 0.0200
    uint public RESERVE_POOL_PORTION = 1000; // 0.1000
    uint public FEE_POOL_PORTION = 500; // 0.0500

    modifier onlyPriceOracle() {
        require(msg.sender == address(priceOracle), "ONLY_PRICE_ORACLE");
        _;
    }

    modifier onlyRandomOracle() {
        require(msg.sender == address(randomOracle), "ONLY_RANDOM_ORACLE");
        _;
    }

    constructor(
        address _ticket,
        address _priceOracle,
        address _randomOracle,
        address _feeCollector,
        address _reservePool,
        uint _maxTicketPerSlot,
        uint _ticketPrice
    ) {
        priceOracle = IPriceOracle(_priceOracle);
        randomOracle = IRandomOracle(_randomOracle);
        ticket = ISignalTicket(_ticket);

        feeCollector = _feeCollector;
        reservePool = _reservePool;

        maxTicketPerSlot = _maxTicketPerSlot;
        ticketPrice = _ticketPrice;
    }

    // External functions
    function placeBid(uint time, uint price, uint amount) external {
        return _placeBid(time, price, amount, msg.sender);
    }

    function settle(uint time) external {
        return _settle(time, msg.sender);
    }

    function collectReserve(uint time) external {
        return _collectReserve(time, msg.sender);
    }

    function collectFee(uint time) external {
        return _collectFee(time, msg.sender);
    }

    function claimPrizes(uint time, uint price, uint amount) external {
        return _claimPrizes(time, price, amount, msg.sender);
    }

    // Internal functions
    function _placeBid(
        uint time,
        uint price,
        uint amount,
        address sender
    ) internal {
        require(slotStatus[time] == Status.Open, "placeBid: Not Open");

        uint[] memory prices = slotPrices[time];
        uint foundIndex = 0;
        bool isFound = false;

        for (uint i = 0; i < prices.length; i++) {
            if (prices[i] == price) {
                foundIndex = i;
                isFound = true;
            }
        }

        if (isFound) {
            uint count = prices.length;
            require(
                count + amount <= maxTicketPerSlot,
                "placeBid: Exceed ticket limit"
            );
            slotPrices[time][foundIndex] = price;
            slotWeights[time][foundIndex] += amount;
        } else {
            require(
                amount <= maxTicketPerSlot,
                "placeBid: Exceed ticket limit"
            );
            slotPrices[time].push(price);
            slotWeights[time].push(amount);
        }

        uint paymentAmount = amount * ticketPrice;
        _transferIn(paymentAmount, sender);
        ticket.mint(time, price, sender, amount);

        slotReward[time] += paymentAmount;
        emit BidPlaced(time, price, sender, amount);
    }

    function _settle(uint time, address sender) internal {
        require(slotStatus[time] != Status.Settled, "settle: Already Settled");
        require(block.timestamp >= time, "settle: Time not passed");

        priceOracle.requestPrice(time);
        randomOracle.requestRandomness(time);

        sender; // Unused variable

        slotStatus[time] = Status.Close;
        emit Settled(time);
    }

    function _collectReserve(uint time, address sender) internal {
        sender; // Unused variable
        require(
            slotStatus[time] == Status.Settled,
            "collectReserve: Slot Not Settled"
        );

        uint totalReserve = 0;

        if (settledExactWeight[time] == 0) {
            totalReserve +=
                (slotReward[time] * EXACT_POOL_PORTION) /
                TOTAL_POOL_PORTION;
        }

        uint endProximityIndex = settledClosestWeights[time].length < 3
            ? settledClosestWeights[time].length
            : 3;
        for (uint i = 0; i < endProximityIndex; i++) {
            if (settledClosestWeights[time][i] == 0) {
                totalReserve +=
                    (slotReward[time] * PROXIMITY_POOL_PORTIONS[i]) /
                    TOTAL_POOL_PORTION;
            }
        }

        uint endFortuneIndex = settledLuckyWeights[time].length < 3
            ? settledLuckyWeights[time].length
            : 3;
        for (uint i = 0; i < endFortuneIndex; i++) {
            if (settledLuckyWeights[time][i] == 0) {
                totalReserve +=
                    (slotReward[time] * FORTUNE_POOL_PORTIONS[i]) /
                    TOTAL_POOL_PORTION;
            }
        }

        _transferOut(totalReserve, reservePool);
        emit CollectedReserve(time, totalReserve); // Emit an event for tracking
    }

    function _collectFee(uint time, address sender) internal {
        sender; // Unused variable

        require(
            slotStatus[time] == Status.Settled,
            "collectFee: Slot Not Settled"
        );

        uint fee = (slotReward[time] * FEE_POOL_PORTION) / TOTAL_POOL_PORTION;

        _transferOut(fee, feeCollector);
        emit CollectedFee(time, fee);
    }

    function _claimPrizes(
        uint time,
        uint price,
        uint amount,
        address sender
    ) internal {
        require(
            slotStatus[time] == Status.Settled,
            "claimWinnerPrize: Not Settled"
        );
        // Burn ticket for claiming
        uint slotTotalReward = slotReward[time];

        uint exactReward = 0;
        {
            if (settledExact[time] == price) {
                exactReward =
                    (slotTotalReward * EXACT_POOL_PORTION * amount) /
                    (TOTAL_POOL_PORTION * settledExactWeight[time]);
                emit ClaimedExactPrize(time, sender, exactReward);
            }
        }

        uint proximityReward = 0;
        {
            uint[3] memory closestPrices = settledClosest[time];
            for (uint i = 0; i < closestPrices.length; i++) {
                uint proximityPrice = closestPrices[i];
                if (proximityPrice == price) {
                    uint reward = ((slotTotalReward *
                        PROXIMITY_POOL_PORTIONS[i]) * amount) /
                        (TOTAL_POOL_PORTION * settledClosestWeights[time][i]);
                    proximityReward += reward;
                    emit ClaimedClosestPrize(time, i, sender, reward);
                }
            }
        }

        uint fortuneReward = 0;
        {
            uint[3] memory luckyPrices = settledLucky[time];
            for (uint i = 0; i < luckyPrices.length; i++) {
                uint luckyPrice = luckyPrices[i];
                if (luckyPrice == price) {
                    uint reward = ((slotTotalReward *
                        FORTUNE_POOL_PORTIONS[i]) * amount) /
                        (TOTAL_POOL_PORTION * settledLuckyWeights[time][i]);
                    fortuneReward += reward;
                    emit ClaimedLuckyPrize(time, i, sender, reward);
                }
            }
        }

        uint totalReward = exactReward + proximityReward + fortuneReward;

        require(totalReward > 0, "claimPrizes: Must get some reward");

        // Burn ticket
        ISignalTicket(ticket).burn(time, price, sender, amount);
        // Transfer reward out
        _transferOut(totalReward, sender);
    }

    // Contract called functions
    function fulfillPrice(uint time, uint price) external override onlyPriceOracle {
        priceOracleFulfilled[time] = true;
        settledExact[time] = price;

        if (randomOracleFulfilled[time]) {
            _handleAllFulfilled(time);
        }
    }

    function fulfillRandomness(
        uint time,
        uint[] calldata values
    ) external override onlyRandomOracle {
        randomOracleFulfilled[time] = true;
        randomOracleResults[time] = values;

        if (priceOracleFulfilled[time]) {
            _handleAllFulfilled(time);
        }
    }

    function _handleAllFulfilled(uint time) internal {
        slotStatus[time] = Status.Settled;

        uint[] memory prices = slotPrices[time];
        uint[] memory weights = slotWeights[time];

        uint price = settledExact[time];
        uint[] memory randomValues = randomOracleResults[time];

        // Settle exact prize (avoid stack too deep)
        bool found = false;
        {
            uint foundIndex = 0;
            for (uint i = 0; i < prices.length; i++) {
                if (prices[i] == price) {
                    foundIndex = i;
                    found = true;
                    break;
                }
            }

            if (found) {
                uint count = weights[foundIndex];
                settledExactWeight[time] = count;
            }
        }

        // Settle closest prize (avoid stack too deep)
        {
            uint[] memory indexes = new uint[](prices.length);
            for (uint i = 0; i < prices.length; i++) {
                indexes[i] = i; // Create a vector of indexes
            }
            indexes = indexes.sortIndicesByValues(prices);

            // Skip exact prize if any
            uint endIndex = indexes.length < 3 ? indexes.length : 3;
            uint indexBuffer = found ? 1 : 0;
            for (uint i = 0; i < endIndex; i++) {
                if (indexes.length > i + indexBuffer) {
                    uint idx = indexes[i + indexBuffer];
                    settledClosest[time][i] = prices[idx];
                    settledClosestWeights[time][i] = weights[idx];
                }
            }
        }

        // Settle fortune prize (avoid stack too deep)
        {
            uint endIndex = prices.length < 3 ? prices.length : 3;
            for (uint i = 0; i < endIndex; i++) {
                uint index = randomValues[i] % prices.length;
                settledLucky[time][i] = prices[index];
                settledLuckyWeights[time][i] = weights[index];
            }
        }

        slotStatus[time] = Status.Settled;

        emit SettleFulfilled(time, price);
    }

    // Virtual functions
    function _transferIn(uint amount, address sender) internal virtual returns (bool);
    function _transferOut(uint amount, address recipient) internal virtual returns (bool);
}
