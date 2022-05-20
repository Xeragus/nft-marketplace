import '../App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import nftMarketContractArtifact from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import { Card, Button, ListGroup, ListGroupItem } from 'react-bootstrap';

function App() {
  const [nfts, setNfts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const nftMarketContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const contract = new ethers.Contract(
      nftMarketContractAddress,
      nftMarketContractArtifact.abi,
      provider
    );
    const marketItems = await contract.fetchMarketItems();

    const formattedItems = await Promise.all(marketItems.map(async marketItem => {
      const tokenURI = await contract.tokenURI(marketItem.tokenId);
      const meta = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(marketItem.price.toString(), 'ether');
      
      return {
        price,
        tokenId: marketItem.tokenId.toNumber(),
        seller: marketItem.seller,
        owner: marketItem.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
    }));

    setNfts(formattedItems);
    setIsDataFetched(true);
  }

  const buyNFT = async (nft) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      process.env.NFT_MARKET_CONTRACT_ADDRESS,
      nftMarketContractArtifact.abi,
      signer
    );
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(
      nft.tokenId, { value: price }
    );
    await transaction.wait();

    loadNFTs();
  }

  if (!isDataFetched) {
    return (
      <div>
        Loading market items...
      </div>
    );
  }

  if (isDataFetched && !nfts.length) {
    return (
      <div>
        No items in marketplace
      </div>
    );
  }

  return (
    <div>
        {
          nfts.map((nft, i) => {
            <Card style={{ width: '18rem' }}>
              <Card.Img variant="top" src={nft.image} />
              <Card.Body>
                <Card.Title>{nft.name}</Card.Title>
                <Card.Text>
                  {nft.description}
                </Card.Text>
              </Card.Body>
              <ListGroup className="list-group-flush">
                <ListGroupItem>{nft.price} ETH</ListGroupItem>
              </ListGroup>
              <Card.Body>
                <Button variant="primary" onClick={() => { buyNFT(nft) }}>Buy</Button>
              </Card.Body>
            </Card>
          })
        }
    </div>
  );
}

export default App;