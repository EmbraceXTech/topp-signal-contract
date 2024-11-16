// SPDX-License-Identifier: MIT

pragma solidity >=0.4.0 <0.9.0;

interface ISDKTransferRouter {
    function transferKAP20(
        address tokenAddr_,
        address recipient_,
        uint256 amount_,
        address bitkubNext_
    ) external;

    function transferKAP721(
        address tokenAddr_,
        address recipient_,
        uint256 tokenId_,
        address bitkubNext_
    ) external;
}