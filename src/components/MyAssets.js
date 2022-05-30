import '../App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import nftMarketContractArtifact from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import nftContractArtifact from '../artifacts/contracts/NFT.sol/NFT.json';
import { Card, Button, ListGroup, ListGroupItem, Row, Col } from 'react-bootstrap';
import { nftContractAddress, nftMarketContractAddress } from '../config';

function App() {
  const [nfts, setNfts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      nftContractAddress,
      nftContractArtifact.abi,
      provider
    );
    const nftMarketContract = new ethers.Contract(
      nftMarketContractAddress,
      nftMarketContractArtifact.abi,
      provider
    );
    const marketItems = await nftMarketContract.fetchMyPurchasedNFTs();
    console.log(marketItems);
    const formattedItems = await Promise.all(marketItems.map(async marketItem => {
      const tokenURI = await nftContract.tokenURI(marketItem.tokenId);
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

  if (!isDataFetched) {
    return (
      <div>
        Loading artworks you own...
      </div>
    );
  }

  if (isDataFetched && !nfts.length) {
    return (
      <div>
        You don't own any art yet. See the <a href="/">Exhibition</a> and buy.
      </div>
    );
  }

  return (
    <div>
        You are the owner of the following artworks:
      <Row>
        {
          nfts.map((nft, i) => (
            <Col xs={6} md={4}>
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
              </Card>
            </Col>
          ))
        }
      </Row>
    </div>
  );
}

export default App;