import { useCallback, useEffect, useReducer } from 'react';
import { reducer } from './redux_hooks/redux';
import { defaultState } from './redux_hooks/state';
import * as ACTIONS from './redux_hooks/constants';

import getWeb3 from './utils/getWeb3';

import VRFD2 from '../src/build/abi/VRFD2.json';
import MainMenu from './components/Menu';
import Main from './components/Main';

import { Container, Divider, Message, Button, Icon } from 'semantic-ui-react';

const App = () => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const {
    errors,
    account,
    contractAddress,
    wrongNetwork,
    diceRolled,
    diceClose,
  } = state;
  const {
    SET_WEB3,
    SET_ERROR,
    ACCOUNT_CHANGE,
    TOGGLE_NETWORK,
    NETWORK_CHANGE,
    SET_DICE_MESSAGE,
  } = ACTIONS;

  const loadWeb3 = useCallback(async () => {
    try {
      const web3 = await getWeb3();
      if (web3) {
        const getAccounts = await web3.eth.getAccounts();
        // create a new instance of the contract - on that specific address
        const contractData = await new web3.eth.Contract(
          VRFD2.abi,
          contractAddress
        );

        const getBalance = await web3.eth.getBalance(getAccounts[0]);
        const getMaxBet = await web3.eth.getBalance(contractAddress);

        dispatch({
          type: SET_WEB3,
          value: {
            web3: web3,
            contract: contractData,
            account: getAccounts,
            balance: getBalance,
            maxBet: getMaxBet,
            loading: false,
          },
        });

        // listen to account change
        window.ethereum.on('accountsChanged', async (acc) => {
          const [newAddress] = acc;
          try {
            if (Object.keys(web3).length !== 0 && contractData) {
              console.log(newAddress);
              const getNewBalance = await web3.eth.getBalance(newAddress);
              const getNewMaxBet = await web3.eth.getBalance(
                contractData.options.address
              );

              dispatch({
                type: ACCOUNT_CHANGE,
                value: { getNewBalance, getNewMaxBet, newAddress },
              });
            }
          } catch (error) {
            dispatch({ type: SET_ERROR, value: error });
          }
        });

        // listen to chain change
        window.ethereum.on('chainChanged', async (chainId) => {
          try {
            let networkId = parseInt(chainId, 16);
            networkId !== 4 && dispatch({ type: TOGGLE_NETWORK });

            if (networkId === 4) {
              const [getNetAccounts] = await web3.eth.getAccounts();
              const getNetBalance = await web3.eth.getBalance(getAccounts[0]);
              const getNetMaxBet = await web3.eth.getBalance(contractAddress);

              dispatch({
                type: NETWORK_CHANGE,
                value: {
                  getNetBalance,
                  getNetAccounts,
                  getNetMaxBet,
                  networkId,
                },
              });
            }
          } catch (error) {
            dispatch({ type: SET_ERROR, value: error });
          }
        });
      } else {
        alert('Smart contract not deployed to selected network');
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [
    SET_ERROR,
    SET_WEB3,
    ACCOUNT_CHANGE,
    NETWORK_CHANGE,
    TOGGLE_NETWORK,
    contractAddress,
  ]);

  useEffect(() => {
    loadWeb3();
  }, [loadWeb3]);

  console.log('state', state);

  return (
    <div className='App'>
      <MainMenu account={account} />
      <Divider horizontal>§</Divider>
      <Main state={state} dispatch={dispatch} />
      <Container>
        {errors && (
          <>
            <Divider horizontal>§</Divider>
            <Message negative>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Message.Header>Code: {errors?.code}</Message.Header>
                <Button
                  style={{
                    padding: '0px',
                    background: 'none',
                    color: 'red',
                    marginRight: '0px',
                  }}
                  onClick={() => dispatch({ type: SET_ERROR, value: null })}
                >
                  <Icon name='close' />
                </Button>
              </div>
              <p style={{ wordBreak: 'break-word' }}>{errors?.message}</p>
            </Message>
          </>
        )}
        {wrongNetwork && (
          <>
            <Divider horizontal>§</Divider>
            <Message negative>
              <Message.Header>Wrong Network</Message.Header>
              <p>Please select from Metamask - Rinkeby Test Network (id 4)</p>
            </Message>
          </>
        )}
        {diceRolled?.events?.DiceRolled && !diceClose && (
          <>
            <Divider horizontal>§</Divider>
            <Message positive>
              <Message.Header>Dice Rolled</Message.Header>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Message.Header>Code: {errors?.code}</Message.Header>
                <Button
                  style={{
                    padding: '0px',
                    background: 'none',
                    color: 'green',
                    marginRight: '0px',
                  }}
                  onClick={() =>
                    dispatch({ type: SET_DICE_MESSAGE, value: null })
                  }
                >
                  <Icon name='close' />
                </Button>
              </div>
              <p>Dice was rolled wait for oracle to pick the winner</p>
            </Message>
          </>
        )}
      </Container>
    </div>
  );
};

export default App;
