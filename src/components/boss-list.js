import { useState, useEffect } from 'react';
import { BossDetails } from "./"
import { Container, Skeleton } from '@mui/material';
import useSWR from 'swr';
import RedditIcon from '@mui/icons-material/Reddit';

import Grid from '@mui/material/Unstable_Grid2';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const initialBCWS = new WebSocket('wss://api.spaghet.io/ws/kotd/boss-comments');
const initialBPWS = new WebSocket('wss://api.spaghet.io/ws/kotd/boss-posts');

const BossList = ({ bossData }) => {

  const [ columnWidth ] = useState(4);
  const [ deadBosses, deadBoss ] = useState([]);
  const [ bosses, updateBosses ] = useState(bossData);  
  const [ bossCommentsWS, openCommentWS ] = useState(initialBCWS);
  const [ bossPostWS, openPostWS ] = useState(initialBPWS);
  const [ newPlayerComment, sendPlayerComment ] = useState(false);
  const [ newBossComment, sendBossComment ] = useState(false);
  const [ totalMaxDmg, updateMaxDmg ] = useState(0)
  const [ storedPlayerName ] = useState(localStorage.getItem('storedPlayerName') || '');

  bossCommentsWS.onopen = function(event) {
    bossCommentsWS.send(`Ping`);
    setInterval(() => {
      bossCommentsWS.send(`Ping`);
    }, 30000);
  };

  bossPostWS.onopen = function(event) {
    bossPostWS.send(`Ping`);
    setInterval(() => {
      bossPostWS.send(`Ping`);
    }, 30000);
  };
  
  bossCommentsWS.onmessage = function(event) {
    const comment = JSON.parse(event.data).payload;
    switch(comment.author) {
      case 'KickOpenTheDoorBot':
        sendBossComment(comment);
        break;
      default:
        sendPlayerComment(comment);
        break;
    }
  };
  
  bossPostWS.onmessage = (event) => {
    const newBoss = JSON.parse(event.data);
    updateBosses([
      ...bosses,
      newBoss
    ]);
  };

  bossCommentsWS.onclose = function(event) {
    openCommentWS(new WebSocket('wss://api.spaghet.io/ws/kotd/boss-comments'));
  };

  bossPostWS.onclose = (event) => {
    openPostWS(new WebSocket('wss://api.spaghet.io/ws/kotd/boss-posts'));
  };

  const bossUpdate = (targetBoss, type) => {
    switch(type) {
      case 'died':
        deadBoss([
          ...deadBosses,
          targetBoss.id
        ]);
        break;
      case 'update':
        const updatedBosses = bosses.map(boss => boss.id === targetBoss.id ? targetBoss : boss);
        updateBosses(updatedBosses);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if(bosses?.length) {
      updateMaxDmg(bosses.reduce((acc, boss) => acc + (boss?.maxDmg ?? 0), 0))
    }
  }, [bosses]);

  const {
    error,
    isValidating,
  } = useSWR(`https://api.spaghet.io/kotd/v1/boss-list/${storedPlayerName}`, fetcher, { revalidateOnFocus: false, onSuccess: updateBosses });

  //Handles error and loading state
  if (error) return <div className='failed'>Rate Limited by <RedditIcon /></div>;
  if(isValidating) return (
    <Container>
    <h4 style={{color: '#FFFFFF', marginBottom: 0}}>Total Max Damage: 💥...</h4>
      <Grid container spacing={1} alignItems="center" justifyContent="center" sx={{maxWidth: '100%'}}>
        {Array.from({length: 3}).map((skelly, p) => (
          <Grid xs={11} sm={6} md={columnWidth} lg={columnWidth} xl={columnWidth} key={'skelly-' + p} alignItems="center" justifyContent="center" style={{position: 'relative', marginTop: 10}}>
            <Skeleton variant="rounded" sx={{bgcolor: '#CCC'}}><BossDetails boss={{}} /></Skeleton>
          </Grid>))}
      </Grid>
    </Container>
  );


  return (
    <>
      <Container>
        {bosses?.length ? <h4 style={{color: '#FFFFFF'}}>Total Max Damage: 💥{totalMaxDmg}</h4> : ''}
        <Grid container spacing={1} alignItems="center" justifyContent="center" sx={{maxWidth: '100%'}}>
          {bosses &&
            bosses.sort((a, b) => a.health.currentHealth - b.health.currentHealth).filter(boss => !deadBosses.includes(boss.id)).map((boss, index) => (
              <Grid xs={11} sm={6} md={columnWidth} lg={columnWidth} xl={columnWidth} key={boss.id} alignItems="center" justifyContent="center" style={{position: 'relative', marginTop: 10}}>
                <BossDetails boss={boss} newBossComment={newBossComment} newPlayerComment={newPlayerComment} bossUpdate={bossUpdate} />
              </Grid>
            ))}
        </Grid>
      </Container>
    </>
  );
};

export { BossList };