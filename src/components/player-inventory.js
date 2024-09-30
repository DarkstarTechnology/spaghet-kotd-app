import * as React from 'react';
import { InventoryFormmater } from './';
import Moment from 'react-moment';

const PlayerInventory = () => {

  const storedPlayerName = localStorage.getItem('storedPlayerName');
  const storedPlayerData = storedPlayerName ? JSON.parse(localStorage.getItem('storedPlayerData')) : {};
  let playerInventory = {created: null, tables: []}
  let lastPoll;
  if(storedPlayerData?.inventory) {
    playerInventory = storedPlayerData?.inventory;
    lastPoll = new Date(playerInventory.checked);
  }

  if(!storedPlayerName) return <h3 style={{color: '#FFFFFF'}}>Enter a username to see your inventory</h3>
  
  if(!playerInventory.tables.length) {
    return <div className='failed'>No recent !inventory call found! Please pull your inventory on Reddit to see it here.</div>
  }
  
  return (
    <div style={{color: '#FFFFFF'}}>
      <h4 style={{color: '#FFFFFF'}}>Last Inventory Check: <Moment fromNow>{lastPoll}</Moment></h4>
      <>{storedPlayerName ? <InventoryFormmater playerInventory={playerInventory} /> : 'Enter a username'}</>
    </div>
  );
};

export { PlayerInventory };