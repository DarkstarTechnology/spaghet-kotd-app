/* eslint-disable no-useless-computed-key */
import { useState, useRef, useEffect } from 'react'
import {Paper, Skeleton, InputBase, IconButton} from '@mui/material';
import SaveAltRoundedIcon from '@mui/icons-material/SaveAltRounded';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';

import useBroadcastChannel from '../services/useBroadcastChannel';
import { setInterval, setTimeout  } from "worker-timers";

import "./component-css/player-details.css";
const tabID = sessionStorage.getItem('tabID');

const PlayerDetails = () => {
  
  const playerInput = useRef(localStorage.getItem('storedPlayerName') || '');
  const playerRefresh = useRef('');
  const [updatedHealth, updateHealth] = useState('');
  const [storedPlayerName, setStoredPlayerName] = useState(localStorage.getItem('storedPlayerName') || '');
  const [storedPlayerData, setStoredPlayerData] = useState(JSON.parse(localStorage.getItem('storedPlayerData')) || {
    isValid: false,
    loading: false
  });
  const [lookupPlayer, setLookupPlayer] = useState(false);
  const { message: {data: playerHealth, eventTab: newPHTabID} } = useBroadcastChannel('player-health');

  localStorage.removeItem('storedPlayerBossData');

  const clearPlayer = (e) => {
    setStoredPlayerName('');
    localStorage.setItem('storedPlayerName', '');
    localStorage.setItem('storedPlayerData', '{}');
    setStoredPlayerData({
      isValid: false,
      loading: false
    })
    window.location.reload();
  }

  const handleSubmit = () => {
    setLookupPlayer(true);
  };

  const handleTextChange= e => playerInput.current = e.target.value;

  const handleBlur = e => playerInput.current = e.target.value;

  const handleEnter = e => {
    if (e.key === 'Enter') {
      if(e.target.value) {
        handleSubmit();
      }
    }
  };

  if(!playerRefresh.current && storedPlayerName) {
    setInterval(handleSubmit, 60000);
    playerRefresh.current = true;
    handleSubmit();
  }
  
  useEffect(() => {
    if(lookupPlayer) {
      setStoredPlayerData({
        ...storedPlayerData,
        loading: true
      });
      localStorage.setItem('storedPlayerData', JSON.stringify(storedPlayerData));
  
      fetch(`https://api.spaghet.io/kotd/v1/player-details/${playerInput.current || storedPlayerName}`).then((res) => res.json()).then(playerData => {
        if(playerData?.isValid) {
          if(!storedPlayerName) {
            setTimeout(() => {
              window.location.reload();
            }, 200);
          }
          setStoredPlayerData(playerData);
          setStoredPlayerName(playerData.player);
          localStorage.setItem('storedPlayerName', playerData.player);
          localStorage.setItem('storedPlayerData', JSON.stringify(playerData));
        } else {
          localStorage.setItem('storedPlayerName', '');
          localStorage.setItem('storedPlayerData', '{}');
          setStoredPlayerData({
            ...storedPlayerData,
            isValid: false,
            loading: false
          });
          setLookupPlayer(false);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupPlayer]);

  useEffect(() => {
    if(newPHTabID === tabID && playerHealth) {
      updateHealth(playerHealth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerHealth]);

  if (storedPlayerData.loading) {
    return <>
      <Skeleton variant="circular" width={45} height={45} sx={{display: 'inline-block', verticalAlign: 'middle', bgcolor: '#CCC'}} />
      <Skeleton variant="rounded" width={146} height={65} sx={{display: 'inline-block', verticalAlign: 'middle', bgcolor: '#CCC'}} />
    </>;
  }

  if(!storedPlayerData.isValid) {
    return <>
      <Paper
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', maxWidth: 200 }}>
        <InputBase
          sx={{ flex: 1 }}
          placeholder="Reddit Username"
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleEnter}
          ref={playerInput}
        />
        <IconButton aria-label="Set Player" className={'ClearButton'} onClick={handleSubmit} >
          <SaveAltRoundedIcon />
        </IconButton>
      </Paper>
    </>
  }

  const {
    flair: {
      rgb
    },
    levels: {
      melee,
      ranged,
      magic,
      constitution

    }
  } = storedPlayerData;

  // eslint-disable-next-line no-unused-vars

  try {
    const wounded = (updatedHealth || storedPlayerData.health) / storedPlayerData.maxHealth  <= 0.25;

    return (
      <div style={{color: '#000', position: 'relative'}}>
        <img className="authorFlairEmoji" alt={storedPlayerData.flair.rank} src={storedPlayerData.flair.icon} style={{maxHeight: 45}} /> 
        <div className="flair authorFlair" style={{position: 'relative', zIndex: 0, backgroundRepeat: 'no-repeat', backgroundPosition: 'center right', backgroundImage: `linear-gradient(to left, rgba(255,255,255, 0.4), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)), url(/assets/${storedPlayerData.race.toLowerCase()}.png)` }}>
          <IconButton  sx={{ position: 'absolute', top: 0, right: 0, zIndex: 2}} size="small" onClick={clearPlayer}><ClearIcon size="small" /></IconButton>
          {storedPlayerName}<br/>
          <span style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', fontSize: 'small'}}>⚔️{melee} 🏹{ranged} 🔮{magic}&nbsp;<FavoriteIcon fontSize='smaller' />{constitution}</span>
          {`${updatedHealth || storedPlayerData.health}${wounded ? '*': ''}/${storedPlayerData.maxHealth}hp`}
        </div> 
        
      </div>
    );

  } catch(e) {
    console.log(e);
    return <div className='failed'>Error loading profile<br/>Refresh</div>
  }
};

export { PlayerDetails };