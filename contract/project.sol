// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CampaignNFTFundraiser {
    uint public nextTokenId;
    address public admin;
    uint public pricePerNFT;
    mapping(address => uint) public contributions;
    mapping(uint => address) public tokenOwners;
    mapping(uint => string) public tokenURIs;

    event NFTMinted(address indexed recipient, uint tokenId, string tokenURI);
    event ContributionReceived(address indexed contributor, uint amount);

    constructor(uint _pricePerNFT) {
        admin = msg.sender;
        pricePerNFT = _pricePerNFT;
    }

    // Mint an NFT for a contributor
    function mintNFT(string memory tokenURI) public payable {
        require(msg.value == pricePerNFT, "Incorrect Ether amount sent.");

        contributions[msg.sender] += msg.value;
        uint tokenId = nextTokenId;
        tokenOwners[tokenId] = msg.sender;
        tokenURIs[tokenId] = tokenURI;
        nextTokenId++;

        emit NFTMinted(msg.sender, tokenId, tokenURI);
        emit ContributionReceived(msg.sender, msg.value);
    }

    // Withdraw funds raised
    function withdrawFunds() public {
        require(msg.sender == admin, "Only admin can withdraw funds.");
        payable(admin).transfer(address(this).balance);
    }

    // Change the price of NFT minting
    function setPrice(uint _newPrice) public {
        require(msg.sender == admin, "Only admin can set the price.");
        pricePerNFT = _newPrice;
    }

    // Function to view contract balance
    function contractBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Function to view contributions made by a specific address
    function getContribution(address contributor) public view returns (uint) {
        return contributions[contributor];
    }

    // Function to view the owner of a token
    function ownerOf(uint tokenId) public view returns (address) {
        return tokenOwners[tokenId];
    }

    // Function to view the URI of a token (renamed to avoid conflict)
    function getTokenURI(uint tokenId) public view returns (string memory) {
        return tokenURIs[tokenId];
    }
}

