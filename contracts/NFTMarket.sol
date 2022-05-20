// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 tax = 0.025 ether;

    struct MarketItem {
        uint itemId;
        uint256 tokenId;
        uint256 price;
        address nftContractAddress;
        address payable seller;
        address payable owner;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItemMap;

    event MarketItemCreated (
        uint indexed itemId,
        uint256 indexed tokenId,
        uint256 price,
        address indexed nftContractAddress,
        address seller,
        address owner,
        bool sold
    );

    constructor() {
        owner = payable(msg.sender);
    }

    function getTax() public view returns (uint256) {
        return tax;
    }

    function createMarketItem(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        // nonReentrant modifier used
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == tax,
            string(
                abi.encodePacked(
                    "The paid tax amount has to be equal to the Minimal Solidarity Tax amount of ",
                    tax,
                    ' ether'
                )   
            )
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItemMap[itemId] = MarketItem(
            itemId,
            tokenId,
            price,
            nftContractAddress,
            payable(msg.sender),
            payable(address(0)),
            false
        );

        IERC721(nftContractAddress).transferFrom(msg.sender, address(this), tokenId);
    }

    function createMarketSale(
        address nftContractAddress,
        uint256 itemId
    ) public payable nonReentrant{
        uint price = idToMarketItemMap[itemId].price;
        uint256 tokenId = idToMarketItemMap[itemId].tokenId;
        console.log(msg.value, tax);
        require(
            msg.value == price,
            string(
                abi.encodePacked(
                    "The price you are trying to pay has to be equal with the price of the product ",
                    price,
                    ' ether'
                )   
            )
        );

        idToMarketItemMap[itemId].seller.transfer(msg.value);
        IERC721(nftContractAddress).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItemMap[itemId].owner = payable(msg.sender);
        idToMarketItemMap[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(tax);
    }

    function fetchMarketItems() public view returns(MarketItem[] memory) {
        uint itemsCount = _itemIds.current();
        uint unsoldItemsCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemsCount);

        for(uint i = 0; i < itemsCount; i++) {
            if (idToMarketItemMap[i + 1].owner == address(0)) {
                uint currentItemId = idToMarketItemMap[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItemMap[currentItemId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyPurchasedNFTs() public view returns(MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint myPurchasedNFTsCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItemMap[i + 1].owner == msg.sender) {
                myPurchasedNFTsCount += 1; 
            }
        }

        MarketItem[] memory myPurchasedNFTs = new MarketItem[](myPurchasedNFTsCount);
        
        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItemMap[i + 1].owner == msg.sender) {
                uint currentId = idToMarketItemMap[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItemMap[currentId];
                myPurchasedNFTs[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return myPurchasedNFTs;
    }

    function fetchMyCreatedNFTs() public view returns(MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint myCreatedNFTsCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItemMap[i + 1].seller == msg.sender) {
                myCreatedNFTsCount += 1; 
            }
        }

        MarketItem[] memory myCreatedNFTs = new MarketItem[](myCreatedNFTsCount);
        
        for(uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItemMap[i + 1].seller == msg.sender) {
                uint currentId = idToMarketItemMap[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItemMap[currentId];
                myCreatedNFTs[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return myCreatedNFTs;
    }
}
