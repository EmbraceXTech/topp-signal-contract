// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface ISignalTicket {
    function mint(uint time, uint price, address recipient, uint amount) external;
    function burn(uint time, uint price, address from, uint amount) external;
}