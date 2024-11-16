pragma solidity ^0.8.0;

import "./KAP20.sol";

contract KKUB is KAP20 {
    constructor(
        address _kyc,
        address _adminProjectRouter,
        address _committee,
        address _transferRouter,
        uint256 _acceptedKYCLevel
    ) KAP20(
        "Wrapped KUB",
        "KKUB",
        "sdk-example-project",
        18,
        _kyc,
        _adminProjectRouter,
        _committee,
        _transferRouter,
        _acceptedKYCLevel
    ) {
    }

    fallback() external payable {
        deposit();
    }
    
    receive() external payable {
        deposit();
    }
    
    function deposit() public whenNotPaused payable {
        _mint(msg.sender, msg.value);
    }
    
    function withdraw(uint256 _value) public whenNotPaused  {
        _burn(msg.sender, _value);
        payable(msg.sender).transfer(_value);
    }
    
}