describe("NFTMarket", function() {
  it("Should create and execute market sales", async function() {
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    let tax = await market.getTax();
    console.log('Tax', tax);
    tax = tax.toString();
    console.log('Tax toString', tax);

    const auctionPrice = ethers.utils.parseUnits('0.025', 'ether')

    await nft.createToken("https://www.mytokenlocation222223434343.com")
    await nft.createToken("https://www.mytokenlocation434343434343332.com")
  
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: tax })
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: tax })
    
    const [_, buyerAddress] = await ethers.getSigners()

    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice})

    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
});
