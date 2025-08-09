// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MinimalTest {
    address public owner;
    string public name;
    
    constructor(string memory _name) {
        owner = msg.sender;
        name = _name;
    }
    
    function getName() public view returns (string memory) {
        return name;
    }
}
