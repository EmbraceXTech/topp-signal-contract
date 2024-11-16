// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISignalTicket.sol";

contract SignalTicketERC1155 is ERC1155, Ownable, ISignalTicket  {

    constructor() ERC1155("https://topp-signal.fun/api/ticket/{id}.json") Ownable(msg.sender)  {}

    function mint(uint time, uint price, address recipient, uint amount) external onlyOwner {
        uint id = combineNumbers(time, price);
        _mint(recipient, id, amount, "");
    }

    function burn(uint time, uint price, address from, uint amount) external onlyOwner {
        uint id = combineNumbers(time, price);
        _burn(from, id, amount);
    }

    function combineNumbers(uint256 num1, uint256 num2) private pure returns (uint256) {
        require(num1 < (1 << 128), "num1 is too large");
        require(num2 < (1 << 128), "num2 is too large");
        return (num1 << 128) | num2;
    }

    function splitNumbers(uint256 combined) private pure returns (uint256, uint256) {
        uint256 num1 = combined >> 128;
        uint256 num2 = combined & ((1 << 128) - 1);
        return (num1, num2);
    }
    
}
