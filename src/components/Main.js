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

const Main = ({ balance, web3, maxBet, onValueChange, amount, makeBet }) => {
  const handleLow = (e) => {
    e.preventDefault();
    //start with digit, digit+dot* or single dot*, end with digit.
    const reg = /^[0-9]*.?[0-9]+$/;
    if (reg.test(amount)) {
      makeBet(0, web3.utils.toWei(amount.toString()));
    } else {
      window.alert('Please type positive integer or float numbers');
    }
  };

  const handleHigh = (e) => {
    e.preventDefault();
    //start with digit, digit+dot* or single dot*, end with digit.
    const reg = /^[0-9]*.?[0-9]+$/;
    if (reg.test(amount)) {
      makeBet(1, web3.utils.toWei(amount.toString()));
    } else {
      window.alert(
        'Please make sure that:\n*You typed positive integer or float number\n* Typed value is >= than MinBet (not all ETH decimals visible)\n* You are using Rinkeby network'
      );
    }
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
        <Image src={dice} wrapped ui={false} />
        <Card.Content>
          <Card.Description
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            <Input
              placeholder='Place Eth Bid...'
              style={{ width: '270px' }}
              onChange={onValueChange}
              type='number'
              min='0'
            />
            <Image src={eth} style={{ width: '15px' }} />
            <p>ETH</p>
          </Card.Description>
          <Divider horizontal>§</Divider>
          <Button.Group style={{ display: 'flex', marginBottom: '20px' }}>
            <Button name='buy' color='red' onClick={handleLow} type='submit'>
              Low
            </Button>
            <Button.Or />
            <Button
              name='sell'
              color='green'
              onClick={handleHigh}
              type='submit'
            >
              High
            </Button>
          </Button.Group>
        </Card.Content>
        <Card.Content>
          {!balance ? (
            <Dimmer active>
              <Loader size='medium'>Loading</Loader>
            </Dimmer>
          ) : (
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
          )}
        </Card.Content>
      </Card>
    </Container>
  );
};
export default Main;
