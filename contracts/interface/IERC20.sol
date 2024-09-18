// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

interface ISaveERC20 {
    function deposit(uint256 _amount) external;

    function withdraw(uint256 _amount) external;

    function getContractBalance() external view returns(uint256);
}