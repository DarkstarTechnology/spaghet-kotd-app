/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { Fab, SvgIcon, Modal, Typography, Box, Grid,
         CircularProgress, Accordion, AccordionSummary, AccordionDetails, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isMobile } from 'react-device-detect';
import InfiniteScroll from 'react-infinite-scroll-component';

import Moment from 'react-moment';
import moment from 'moment';
import Markdown from 'markdown-to-jsx';

moment.relativeTimeThreshold('m', 60);
// created function to handle API request
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const DeadBosses = () => {
  const [ deadBosses, updateBosses ] = useState([]);
  const [ showDeadBosses, openDeadBosses ] = useState(false);
  const [ page, setPage ] = useState(0);
  const [ hasMore, moreData ] = useState(true);
  const [ isLoading, loading ] = useState(false);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: isMobile ? '100vw' : '50vw',
    width: isMobile ? '98vw' : 'inherit',
    minWidth: '100px',
    overflow: 'auto',
    p: 4
  };

  const textOverflow = {
    textAlign: 'center',
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "pre-line",
    display: "-webkit-box",
    WebkitLineClamp: "1",
    WebkitBoxOrient: "vertical",
  };

  const getFlairColor = (flairText) => {
    // eslint-disable-next-line no-unused-vars
    const [race, levels] = flairText?.trim()?.split(' ') ?? ['', ''];
    switch(race) {
      case '':
      case 'Plant':
      case 'Kobold':
        return '#000'
      default:
        return '#FFF'
    }
  }

  const hexToRgb = (hex) =>  {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  const getDeadBosses = (refresh) => {
    loading(true);
    fetcher(`https://api.spaghet.io/kotd/v1/dead-bosses`, {method: 'POST', body: refresh ? 0 : page}).then((data) => {
      updateBosses([
        ...(refresh ? [] : deadBosses),
        ...data
      ]);
      setPage(refresh ? 20 : page + 20);
      moreData(data.length === 20);
      loading(false);
    });
  }

  useEffect(() => {
    if(showDeadBosses && !deadBosses.length) {
      getDeadBosses();
    }
  }, [showDeadBosses]);

  return (
    <>
      <Stack sx={{position: 'fixed', right: 20, bottom: 20, zIndex: 10000}}>
        {showDeadBosses ? 
          <Fab color="primary" onClick={() => !isLoading && (updateBosses([]) || getDeadBosses(true))} disabled={isLoading}>
            <RefreshIcon fontSize="large" />
          </Fab> : ''}
        <Fab color="error" onClick={() => openDeadBosses(!showDeadBosses)}>
          {showDeadBosses ? <CloseIcon fontSize="large" /> : <SvgIcon fontSize="large" ><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a9 9 0 0 0-9 9a8.99 8.99 0 0 0 4 7.47V22h2v-3h2v3h2v-3h2v3h2v-3.54c2.47-1.65 4-4.46 4-7.46a9 9 0 0 0-9-9m-4 9a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m8 0a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m-4 3l1.5 3h-3z"/></svg></SvgIcon>}
        </Fab>
      </Stack>
      <Modal
        open={showDeadBosses}
        onClose={() => openDeadBosses(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box id="deadBosses" sx={modalStyle}>
        <InfiniteScroll
          style={{minWidth: '100px'}}
          height={deadBosses.length ? "95vh" : '100px'}
          dataLength={deadBosses.length} //This is important field to render the next data
          next={getDeadBosses}
          hasMore={hasMore}
          loader={<Box sx={{textAlign: 'center', minHeight: '100px'}}><CircularProgress size="4rem" sx={{color: '#F00'}} /></Box>}
          endMessage={
            <p style={{ textAlign: 'center', color: '#FFF' }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
            {deadBosses.map((boss, aIndex) => {
              const {
                killingBlow: {
                  player,
                  player: {
                    player: killer,
                    bgColor
                  },
                  killed,
                  comment: {
                    body: command,
                    botReply: {
                      body: rewards
                    }
                  }
                },
                health: {
                  currentHealth: bossHealth
                }
              } = boss;

              const rgb = hexToRgb(bgColor);
            return <Accordion 
                      variant="outlined" 
                      sx={{
                        color: getFlairColor(player?.flairText), 
                        width: '100%', 
                        border: '2px solid #000', 
                        backgroundRepeat: 'no-repeat', 
                        backgroundPosition: 'center center',
                        backgroundImage: `radial-gradient(circle at center, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)), url(/assets/${player.race.toLowerCase()}.png)` 
                      }} 
                      key={boss.id} 
                    >
                      <AccordionSummary 
                        sx={{
                            position: 'relative', 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            alignItems: 'center'
                        }}
                        expandIcon={<ExpandMoreIcon />} >
                        <Box sx={{ flexGrow: 1 }}>
                          <Grid container spacing={1} direction="row" sx={{ justifyContent: "space-between", alignItems: "center"}}>
                            <Grid item sx={{fontSize: '2rem'}} xs={2}>
                              {boss?.stars?.length}★
                            </Grid>
                            <Grid item xs={8} sx={textOverflow}>
                              {boss.title}
                            </Grid>
                            <Grid item xs={2}>
                              {bossHealth}hp
                            </Grid>
                            <Grid item xs={8} sx={textOverflow}>
                              <Typography sx={{fontSize: '1.2rem', textAlign: 'left'}}>
                                u/{killer}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} sx={{textAlign: 'right'}}>
                              <small><i><Moment fromNow>{killed}</Moment></i></small>
                            </Grid>
                          </Grid>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ flexGrow: 1 }}>
                          {command}
                          <hr/>
                          <Markdown>{rewards}</Markdown>
                        </Box>
                      </AccordionDetails>
                  </Accordion>
            })}
          </InfiniteScroll>
        </Box>
      </Modal>
    </>
    
  );
};

export { DeadBosses };