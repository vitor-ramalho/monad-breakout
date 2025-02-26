// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PerpetualContract {
    struct Position {
        address trader;
        uint256 size;
        uint256 margin;
        bool isLong;
        uint256 entryPrice;
    }

    mapping(address => Position) public positions;
    uint256 public fundingRate; // Example: Funding rate applied per trade
    
    event PositionOpened(address indexed trader, uint256 size, bool isLong, uint256 entryPrice);
    event PositionClosed(address indexed trader, uint256 size, uint256 exitPrice, int256 pnl);
    
    function openPosition(uint256 _size, bool _isLong, uint256 _entryPrice) external payable {
        require(msg.value > 0, "Margin required");
        require(positions[msg.sender].size == 0, "Close existing position first");

        positions[msg.sender] = Position({
            trader: msg.sender,
            size: _size,
            margin: msg.value,
            isLong: _isLong,
            entryPrice: _entryPrice
        });

        emit PositionOpened(msg.sender, _size, _isLong, _entryPrice);
    }
    
    function closePosition(uint256 _exitPrice) external {
        Position memory position = positions[msg.sender];
        require(position.size > 0, "No open position");
        
        int256 pnl = calculatePnL(position, _exitPrice);
        delete positions[msg.sender];
        
        if (pnl > 0) {
            payable(msg.sender).transfer(uint256(pnl));
        }
        
        emit PositionClosed(msg.sender, position.size, _exitPrice, pnl);
    }
    
    function calculatePnL(Position memory position, uint256 _exitPrice) internal view returns (int256) {
        int256 priceDiff = int256(_exitPrice) - int256(position.entryPrice);
        int256 pnl = position.isLong ? priceDiff * int256(position.size) : -priceDiff * int256(position.size);
        return pnl;
    }
}
