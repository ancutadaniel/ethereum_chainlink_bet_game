import { useState } from 'react';
import { Menu, Icon } from 'semantic-ui-react';

import './Menu.css';

const MainMenu = ({ account }) => {
  const [activeItem, setActiveItem] = useState('bet');

  const handleItemClick = (e, { name }) => setActiveItem(name);

  return (
    <Menu id='main_menu'>
      <Menu.Item
        name='Bet Game'
        active={activeItem === 'bet'}
        onClick={handleItemClick}
      />
      <p className='account'>
        <Icon name='user' />
        <a
          className='text-white'
          style={{ color: 'white' }}
          href={`https://rinkeby.etherscan.io/address/${account}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {account}
        </a>
        &nbsp;
      </p>
    </Menu>
  );
};

export default MainMenu;
