// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface IToppSignalPool {
    enum Status {
        Open,
        Close,
        Settled
    }

    event BidPlaced(uint indexed time, uint indexed price, address indexed bidder, uint amount);
    event Settled(uint indexed time);
    event SettleFulfilled(uint indexed time, uint oraclePrice);
    event ClaimedExactPrize(uint indexed time, address indexed claimer, uint amount);
    event ClaimedClosestPrize(uint indexed time, uint indexed index, address indexed claimer, uint amount);
    event ClaimedLuckyPrize(uint indexed time, uint indexed index, address indexed claimer, uint amount);
    event CollectedReserve(uint indexed time, uint amount);
    event CollectedFee(uint indexed time, uint amount);
}