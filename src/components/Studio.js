import '../App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import nftMarketContractArtifact from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import nftContractArtifact from '../artifacts/contracts/NFT.sol/NFT.json';
import { Form, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { create as ipfsHTTPClient } from 'ipfs-http-client';
import { Navigate } from "react-router-dom";

import {
  nftContractAddress, nftMarketContractAddress
} from '../config'

function App() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: ''
  });
  const INFURA_IPFS_URL = 'https://ipfs.infura.io:5001';
  const INFURA_API_URL = 'https://ipfs.infura.io/ipfs';
  const client = ipfsHTTPClient(INFURA_IPFS_URL);

  const onUploadFile = async (event) => {
    const file = event.target.files[0];

    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`Received: ${prog}`)
        }
      );
      const url = `${INFURA_API_URL}/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  const createItem = async () => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) {
      return;
    }

    const data = JSON.stringify({
      name, description, image: fileUrl
    });

    try {
      const added = await client.add(data);
      const url = `${INFURA_API_URL}/${added.path}`
      listNFTForSale(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  const listNFTForSale = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftContractAddress, nftContractArtifact.abi, signer);
    let transaction = await contract.createToken(url);
    const tx = await transaction.wait();
    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, 'ether');
  
    contract = new ethers.Contract(nftMarketContractAddress, nftMarketContractArtifact.abi, signer);
    const tax = await contract.getTax();

    transaction = await contract.createMarketItem(
      nftContractAddress,
      tokenId,
      price.toString(),
      {
        value: tax.toString()
      }
    );

    await transaction.wait();

    <Navigate replace to="/" />
  }

  return (
    <div>
      <h1>Create & sell your artwork</h1>
      <Form style={{width: '600px', margin: '0 auto', paddingTop: '50px'}}>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            type="text" placeholder="Sunny saturday afternoon in Paris"
            onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea" rows={3} placeholder="How can anyone decribe these beautiful scene"
            onChange={e => updateFormInput({ ...formInput, description: e.target.value })}  
          />
        </Form.Group>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Picture</Form.Label>
          <Form.Control type="file" onChange={onUploadFile} />
          {
            fileUrl && (
              <img className="mt-4" width="350" src={fileUrl} />
            )
          }
        </Form.Group>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Price (ETH)</Form.Label>
          <Form.Control 
            type="number"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}  
          />
        </Form.Group>
      </Form>
      <Button variant="primary" className="mt-5" onClick={createItem}>
        Create & Sell
      </Button>
    </div>
  );
}

export default App;