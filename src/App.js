import React, { useEffect, useState } from 'react';
import getWeb3 from './utils/getWeb3';

import VRFD2 from '../src/build/abi/VRFD2.json';
import MainMenu from './components/Menu';
import Loading from './components/Loading';
import Main from './components/Main';

import {
  Container,
  Divider,
  Message,
  Segment,
  Dimmer,
  Loader,
} from 'semantic-ui-react';

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState({});
  const [balance, setBalance] = useState();
  const [maxBet, setMaxBet] = useState();
  const [amount, setAmount] = useState();

  const [web3, setWeb3] = useState({});

  const [netId, setNetworkId] = useState();
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [errors, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [diceRolled, setDiceRolled] = useState({});
  const [bet, setBet] = useState();

  const contractAddress = '0xABdBFF30838d4946B693A6a2798CaeA067660a6E'; // rinkeby

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      let getAccounts, getBalance, getMaxBet, networkId;
      if (web3) {
        getAccounts = await web3.eth.getAccounts();
        networkId = await web3.eth.net.getId();

        networkId !== 4 ? setWrongNetwork(true) : setWrongNetwork(false);

        const contractData = await new web3.eth.Contract(
          VRFD2.abi,
          contractAddress
        );

        getBalance = await web3.eth.getBalance(getAccounts[0]);
        getMaxBet = await web3.eth.getBalance(contractAddress);

        setContract(contractData);
        setBalance(getBalance);
        setMaxBet(getMaxBet);
        setNetworkId(networkId);
      } else {
        alert('Smart contract not deployed to selected network');
      }

      window.ethereum.on('accountsChanged', async (acc) => {
        if (typeof acc[0] !== 'undefined' && acc[0] !== null) {
          getBalance = await web3.eth.getBalance(acc[0]);
          getMaxBet = await web3.eth.getBalance(contractAddress);

          setBalance(getBalance);
          setMaxBet(getMaxBet);
          setAccounts(acc);
        }
      });

      window.ethereum.on('chainChanged', async (chainId) => {
        networkId = parseInt(chainId, 16);
        networkId !== 4 ? setWrongNetwork(true) : setWrongNetwork(false);

        if (networkId === 4) {
          getAccounts = await web3.eth.getAccounts();
          getBalance = await web3.eth.getBalance(getAccounts[0]);
          getMaxBet = await web3.eth.getBalance(contractAddress);
          setBalance(getBalance);
          setMaxBet(getMaxBet);
        }
        setNetworkId(networkId);
      });

      setWeb3(web3);
      setAccounts(getAccounts);
      setLoading(false);
    } catch (error) {
      setError(error);
    }
  };

  const makeBet = async (bet) => {
    setBet(bet);
    try {
      //Send bet to the contract and wait for the verdict
      setLoading(true);
      const data = await contract.methods
        .rollDice(accounts[0])
        .send({ from: accounts[0] });

      if (data) {
        setDiceRolled(data);
        setLoading(false);
      }
    } catch (error) {
      setError(error);
    }
  };

  const getValueOracle = async () => {
    setLoading(true);
    try {
      const data = await contract.methods?.game(accounts[0], bet).send({
        from: accounts[0],
        value: amount,
      });
      console.log(data);
      setLoading(false);
    } catch (error) {
      setError(error);
    }
  };

  const onValueChange = (e) => setAmount(e.target.value);

  useEffect(() => {
    console.log(contract);
    getValueOracle();
  }, [diceRolled]);

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <div className='App'>
      <MainMenu account={accounts[0]} />
      <Divider horizontal>§</Divider>

      <Container>
        {loading && Object.keys(web3).length > 0 ? (
          <Loading balance={balance} web3={web3} maxBet={maxBet} />
        ) : (
          <Main
            balance={balance}
            web3={web3}
            maxBet={maxBet}
            onValueChange={onValueChange}
            amount={amount}
            makeBet={makeBet}
          />
        )}
      </Container>

      <Container>
        {errors && (
          <>
            <Divider horizontal>§</Divider>
            <Message negative>
              <Message.Header>Code: {errors?.code}</Message.Header>
              <p style={{ wordBreak: 'break-word' }}>{errors?.message}</p>
            </Message>
          </>
        )}
        {wrongNetwork && (
          <Message negative>
            <Message.Header>Wrong Network</Message.Header>
            <p>Please select from Metamask - Rinkeby Test Network (id 4)</p>
          </Message>
        )}
        <Divider horizontal>§</Divider>
        {diceRolled?.events?.DiceRolled && (
          <Message positive>
            <Message.Header>Dice Rolled</Message.Header>
            <p>Dice was rolled wait for oracle to pick the winner</p>
          </Message>
        )}
      </Container>
    </div>
  );
};

export default App;
