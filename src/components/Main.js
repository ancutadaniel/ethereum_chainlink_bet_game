import {
  Card,
  Container,
  Image,
  Input,
  Button,
  Divider,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import eth from '../logos/eth.png';
import dice from '../logos/dice.webp';
import dice_rolling from '../logos/dice_rolling.gif';
import * as ACTIONS from '../redux_hooks/constants';
import { useCallback } from 'react';

const Main = ({ state, dispatch }) => {
  const { account, contract, balance, web3, maxBet, amount, bet, loading } =
    state;
  const { SET_ERROR, SET_AMOUNT, DICE_ROLLED, SET_LOADING, BET } = ACTIONS;

  const handleLow = () => {
    if (amount) {
      makeBets();
      dispatch({ type: BET, value: 0 });
    } else {
      dispatch({
        type: SET_ERROR,
        value: `Please type positive integer or float numbers`,
      });
    }
  };

  const handleHigh = () => {
    if (amount) {
      makeBets();
      dispatch({ type: BET, value: 1 });
    } else {
      dispatch({
        type: SET_ERROR,
        value: `Please make sure that:\n*You typed positive integer or float number\n* Typed value is >= than MinBet (not all ETH decimals visible)\n* You are using Rinkeby network`,
      });
    }
  };

  const makeBets = async () => {
    dispatch({ type: SET_LOADING });
    try {
      //Send bet to the contract and wait for the verdict
      const data = await contract.methods
        .rollDice(account)
        .send({ from: account });
      if (data) {
        dispatch({ type: DICE_ROLLED, value: data });
        getValueOracle();
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  };

  const getValueOracle = useCallback(async () => {
    dispatch({ type: SET_LOADING });
    try {
      const betValue = web3.utils.toWei(bet.toString());
      const data = await contract.methods?.game(account, betValue).send({
        from: account,
        value: amount,
      });

      console.log('oracle', data);

      if (data) dispatch({ type: SET_LOADING });
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [
    SET_ERROR,
    SET_LOADING,
    account,
    amount,
    bet,
    contract.methods,
    web3,
    dispatch,
  ]);

  const handleAmount = (e) => {
    const amountWei = web3.utils.toWei(e.target.value, 'ether');
    dispatch({ type: SET_AMOUNT, value: amountWei });
  };

  let maxValue = 0;
  let balanceValue = 0;

  if (Object.keys(web3).length > 0) {
    maxValue = Number(web3.utils.fromWei(maxBet.toString())).toFixed(5);
    balanceValue = Number(web3.utils.fromWei(balance.toString())).toFixed(5);
  }

  return (
    <Container>
      <Card centered style={{ width: '350px' }}>
        <Image src={`${!loading ? dice : dice_rolling}`} wrapped ui={false} />
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
        <Card.Content>
          <Card.Description
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            <Input
              placeholder={`${!loading ? 'Place Eth Bid...' : 'rolling...'}`}
              style={{ width: '270px' }}
              onChange={handleAmount}
              type='text'
            />
            <Image src={eth} style={{ width: '15px' }} />
            <p>ETH</p>
          </Card.Description>
          <Divider horizontal>§</Divider>
          <Button.Group style={{ display: 'flex', marginBottom: '20px' }}>
            <Button
              name='buy'
              color='red'
              onClick={handleLow}
              type='button'
              disabled={+amount <= 0 || loading}
            >
              Low
            </Button>
            <Button.Or />
            <Button
              name='sell'
              color='green'
              onClick={handleHigh}
              type='button'
              disabled={+amount <= 0 || loading}
            >
              High
            </Button>
          </Button.Group>
        </Card.Content>
        <Card.Content>
          <Container
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            <div>
              <b>MaxBet:</b>
            </div>
            <div>
              {maxValue}
              <b> ETH</b>
            </div>
            <br></br>
            <div>
              <b>Balance:</b>
            </div>
            <div>
              {balanceValue}
              <b> ETH</b>
            </div>
          </Container>
        </Card.Content>
      </Card>
    </Container>
  );
};
export default Main;
