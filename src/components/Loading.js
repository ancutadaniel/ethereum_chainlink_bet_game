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
import dice_rolling from '../logos/dice_rolling.gif';
import eth from '../logos/eth.png';

const Loading = ({ balance, web3, maxBet }) => {
  let maxValue = 0;
  let balanceValue = 0;

  if (Object.keys(web3).length > 0) {
    maxValue = Number(web3.utils.fromWei(maxBet.toString())).toFixed(5);
    balanceValue = Number(web3.utils.fromWei(balance.toString())).toFixed(5);
  }

  return (
    <Container>
      <Card centered style={{ width: '350px' }}>
        <Image src={dice_rolling} wrapped ui={false} />
        <Card.Content>
          <Card.Description
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            <Input
              placeholder='rolling...'
              style={{ width: '270px' }}
              disabled
            />
            <Image src={eth} style={{ width: '15px' }} />
            <p>ETH</p>
          </Card.Description>
          <Divider horizontal>§</Divider>
          <Button.Group style={{ display: 'flex', marginBottom: '20px' }}>
            <Button name='buy' color='red' disabled>
              Low
            </Button>
            <Button.Or />
            <Button name='sell' color='green' disabled>
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

export default Loading;
