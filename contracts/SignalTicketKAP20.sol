// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./token/KAP20.sol";

contract SignalTicketKAP20 is KAP20 {
    constructor(
        address _kyc,
        address _adminProjectRouter,
        address _committee,
        address _transferRouter
    )
        KAP20(
            "Signal Ticket",
            "STK",
            "topp-signal",
            18,
            _kyc,
            _adminProjectRouter,
            _committee,
            _transferRouter,
            4
        )
    {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}