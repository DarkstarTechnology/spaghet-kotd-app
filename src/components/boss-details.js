/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-computed-key */
import { useState, useEffect, useRef } from 'react';
import Markdown from 'markdown-to-jsx';
import _ from 'lodash';

import Moment from 'react-moment';
import moment from 'moment';
import Flippy, { FrontSide, BackSide } from 'react-flippy';
import { isMobile } from 'react-device-detect';
import useSound from 'use-sound';

import { styled, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, 
        IconButton, Typography, TextField, 
        Button, ButtonGroup, Stack, Divider, Link, LinearProgress, 
        linearProgressClasses, Box, Alert, AlertTitle, Pagination, 
        Snackbar, Skeleton, Badge, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RedditIcon from '@mui/icons-material/Reddit';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlipIcon from '@mui/icons-material/Flip';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';

import "./component-css/boss-details.css";
import { CopyToClipboardButton, PlayerDetails } from './';
import PlayerCommentSound from './PlayerComment.ogg';
import useBroadcastChannel from '../services/useBroadcastChannel';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotateY(0deg)' : 'rotateY(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: '0.6s',
  }),
}));
  
const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#ff0000',
  },
}));

const defaultPlayerDetails = {
  loading: false,
  waitingForBot: false,
  validAttack: false,
  created: '', 
  command: '', 
  elementResult: '', 
  element: '',
  id: '', 
  elementUnknown: false, 
  damage: 0, 
  gold: 0
};

const defaultPlayerNotice = {
  message: '',
  severity: '',
  show: false
};

moment.relativeTimeThreshold('m', 60);

const tabID = sessionStorage.getItem('tabID');

const BossDetails = (props) => {
  const { boss, 
          newPlayerComment, 
          newBossComment, 
          bossUpdate } = props;

  const [currentHealth, setCurrentHealth] = useState(boss?.health?.currentHealth ?? 0);
  const [maxGold, setMaxGold] = useState(boss?.maxGold ?? 0);
  const [maxDmg, setMaxDmg] = useState(boss?.maxDmg ?? 0);
  const [includeMaxDmg, setIncMaxDmg] = useState(true);
  const [allBossComments, setAllBossComments] = useState(boss?.comments ?? []);
  const [allBossCommentsBackup, backupBossComments] = useState([]);
  const [incomingPlayerComment] = useSound(PlayerCommentSound);
  const [expanded, setExpanded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultFormat, setResultFormat] = useState('summary');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMe, onlyShowMe] = useState(false);
  const [storedPlayerName] = useState(localStorage.getItem('storedPlayerName'));
  const [currentCommentPage, setCommentPage] = useState(0);
  const [playerHealthComments, updatePlayerHealthComments] = useState([]);
  const [playerBossDetails, setPlayerBossDetails] = useState(boss?.playerData ?? defaultPlayerDetails);
  const [playerBossDetailsBackup, backupPlayerBossDetails] = useState(defaultPlayerDetails);
  const [playerNotice, setPlayerNotice] = useState(defaultPlayerNotice);
  const updatedPlayerBossDetails = useRef();

  const { sendMessage: playerHealthOut } = useBroadcastChannel('player-health');
  
  useEffect(() => {
    if(newBossComment && newBossComment.bossID.includes(boss.id)) {

      const {
        bossHealth,
        tooSoonMatch,
        playerHealth,
        specials,
        parentID
      } = newBossComment;

      const isMine = playerBossDetails.id && parentID.includes(playerBossDetails.id) && newBossComment.body.includes('💥') && playerBossDetails.validAttack;

      const pageIndex = allBossComments.findIndex(page => page.filter(comment => parentID.includes(comment.id)).length);

      if(allBossComments.length && pageIndex >= 0) {
        const {
          [0]: {
            index: commentIndex
          }
        } = allBossComments[pageIndex].map((comment, index) => ({id: comment.id, index})).filter(comment => parentID.includes(comment.id));

        const seletedComment = allBossComments[pageIndex][commentIndex];
        
        setAllBossComments([
          ...allBossComments.slice(0, pageIndex),
          [
            ...allBossComments[pageIndex].slice(0, commentIndex),
            {
              ...seletedComment,
              replies: [
                ...seletedComment.replies,
                {
                  ...newBossComment,
                  show: false,
                },
              ]
            },
            ...allBossComments[pageIndex].slice(commentIndex + 1),
          ],
          ...allBossComments.slice(pageIndex + 1)
        ]);
      }

      Object.keys(specials).forEach((s) => {
        if(specials[s]) {
          boss.specialStats[s].push(true);
        }
      })

      if(bossHealth !== 'No Update' && +currentHealth > +bossHealth) {
        if(+bossHealth <= 5) {
          bossUpdate({
            ...boss,
            health: {
              ...boss.health,
              currentHealth: 0
            },
            maxDmg: 0
          }, 'died');
          return;
        }
        setCurrentHealth(bossHealth);
        const calcMaxGold = Math.floor((0.086 * boss.health.maxHealth ** 0.547 * (boss.health.maxHealth - bossHealth) ** 0.263 + 10) * boss.stars.length ** 0.167);
        const calcMaxDmg = Math.ceil(0.08 * boss.health.maxHealth ** 0.15 * bossHealth ** 0.5 * boss.stars.length ** 1.7);
        setMaxGold(calcMaxGold);
        setMaxDmg(calcMaxDmg);
        bossUpdate({
          ...boss,
          maxDmg: includeMaxDmg ? calcMaxDmg : 0,
          health: {
            ...boss.health,
            currentHealth: +bossHealth
          }
        }, 'update');
      }

      if(isMine) {
        const newPlayerBossDetails = {
          ...playerBossDetails,
          ...newBossComment
        };

        if(localStorage.getItem('storedPlayerBossData')) {
          let playerBossData = JSON.parse(localStorage.getItem('storedPlayerBossData'));
          playerBossData[boss.id] = newPlayerBossDetails;
          localStorage.setItem('storedPlayerBossData', JSON.stringify(playerBossData));
        }

        setPlayerBossDetails(newPlayerBossDetails);
        setShowResult(true); 
      } else if(playerBossDetails.id && newBossComment.parentID.includes(playerBossDetails.id) && !newBossComment.body.includes('💥') && playerBossDetails.validAttack) {
        setPlayerBossDetails({
          ...playerBossDetailsBackup,
          loading: false,
          waitingForBot: false
        });
        if(tooSoonMatch) {
          setPlayerNotice({
            message: tooSoonMatch,
            severity: 'warning',
            show: true
          });
        }
        if(localStorage.getItem('storedPlayerBossData')) {
          let playerBossData = JSON.parse(localStorage.getItem('storedPlayerBossData'));
          playerBossData[boss.id] = playerBossDetailsBackup;
          localStorage.setItem('storedPlayerBossData', JSON.stringify(playerBossData));
        }
      }

      if(playerHealthComments.includes(parentID) && playerHealth !== '') {
        playerHealthOut(playerHealth);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBossComment]);

  useEffect(() => {
    if(newPlayerComment && newPlayerComment.bossID.includes(boss.id)) {
      //console.log('newComment from Player Comment Event', newPlayerComment);
      if(expanded) {
        incomingPlayerComment();
      }

      const {
        validHealthCommand,
        author,
        id,
        validAttack
      } = newPlayerComment;

      const isMe = storedPlayerName.toLowerCase() === author.toLowerCase();
    
      if(isMe) {
        if(validHealthCommand) {
          updatePlayerHealthComments([
            ...playerHealthComments,
            id
          ]);
        }

        if(validAttack) {
          backupPlayerBossDetails(playerBossDetails);
          setPlayerBossDetails({
            ...playerBossDetails,
            ...newPlayerComment
          }); 

          if(localStorage.getItem('storedPlayerBossData')) {
            let playerBossData = JSON.parse(localStorage.getItem('storedPlayerBossData'));
            playerBossData[boss.id] = playerBossDetails;
            localStorage.setItem('storedPlayerBossData', JSON.stringify(playerBossData));
          }
        }
      }

      if(allBossComments?.length && allBossComments[0].length < 20) {
        setAllBossComments([
          [
            newPlayerComment,
            ...allBossComments[0]
          ],
          ...allBossComments.slice(1)
        ]);
      } else if(!allBossComments.length || allBossComments[0]?.length === 20) {
        const newPage = [newPlayerComment];
        setAllBossComments([
          newPage,
          ...allBossComments
        ]);
      }
      setCommentPage(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPlayerComment]);

  const refreshBossComments = (boss) => {
    onlyShowMe(false);
    if(expanded) {
      setLoadingComments(true);
      setAllBossComments([]);
      fetch(boss.commentData).then((res) => res.json()).then((comments) => {
        setLoadingComments(false);
        setAllBossComments(comments);
        setCommentPage(0);
      });
    }
  }

  const handleExpandClick = () => {
    if(boss.comments.length && !allBossComments.length) {
      setAllBossComments(boss.comments);
    }
    setExpanded(!expanded);
  };

  const handleCommandClick = (event, link, text) => {
    event.preventDefault();
    navigator.clipboard.writeText(text);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const openLastComment = (event, copy) => {
    const link = `https://www.reddit.com/r/kickopenthedoor/comments/${boss.id}/comment/${playerBossDetails.id}/`;
  
    if(copy) {
      handleCommandClick(event, link, playerBossDetails.command);
    } else {
      event.preventDefault();
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };
  
  const closeAllComments = () => {
    setAllBossComments([]);
  }

  const closeSingleComment = (closeComment) => {
    setAllBossComments([
      ...allBossComments.slice(0, currentCommentPage),
      [
        ...allBossComments[currentCommentPage].filter(comment => comment.id !== closeComment.id)
      ],
      ...allBossComments.slice(currentCommentPage + 1)
    ].filter(page => page.length));
  } 

  const showReply = (seletedComment, selectedReply, indexes) => {
    const [commentIndex, replyIndex] = indexes;
    
    setAllBossComments([
      ...allBossComments.slice(0, currentCommentPage),
      [
        ...allBossComments[currentCommentPage].slice(0, commentIndex),
        {
          ...seletedComment,
          replies: [
            ...seletedComment.replies.slice(0, replyIndex),
            {
              ...selectedReply,
              show: !selectedReply.show,
            },
            ...seletedComment.replies.slice(replyIndex + 1)
          ]
        },
        ...allBossComments[currentCommentPage].slice(commentIndex + 1),
      ],
      ...allBossComments.slice(currentCommentPage + 1)
    ]);
  }

  const handleCommentsPageChange = (e, page) => {
    setCommentPage(page - 1);
    const commentSection = document.getElementById(`${boss.id}-backside`);
    commentSection.scrollTo({top: 0, behavior: 'smooth'});
  }  
  
  const hexToRgb = (hex) =>  {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  const getFlairRGB = (hex) => {
    const {r,g,b} = hexToRgb(hex);
    return [r, g, b].join(',');
  }

  const getRaceImage = (flairText) => {
    const [race, levels] = flairText?.trim()?.split(' ') ?? ['', ''];
    return race.toLowerCase();
  }

  const getFlairColor = (flairText) => {
    // eslint-disable-next-line no-unused-vars
    const [race, levels] = flairText?.trim()?.split(' ') ?? ['', ''];
    switch(race) {
      case '':
      case 'Gnome':
      case 'Troll':
      case 'Demon':
        return '#FFF'
      default:
        return '#000'
    }
  }

  const classIcon = (className) => {
    switch(className) {
      case 'magic':
        return '🔮';
      case 'melee':
        return '⚔️';
      case 'range':
        return '🏹'
      default:
        return '❓'
    }
  }

  const toggleMaxDmg = () => {
    setIncMaxDmg(!includeMaxDmg);
    bossUpdate({
      ...boss,
      maxDmg: !includeMaxDmg ? maxDmg : 0,
    }, 'update');
  }

  const getMyComments = () => {
    onlyShowMe(!showMe);
    if(!showMe) {
      backupBossComments(allBossComments);
      setAllBossComments(
        _.chain(allBossComments)
        .flatten()
        .filter(comment => comment.author === storedPlayerName)
        .chunk(10)
        .value()
      ) 
    } else {
      setAllBossComments(
        _.chain(allBossCommentsBackup)
        .flatten()
        .concat(allBossComments.flat())
        .uniqBy('id')
        .sortBy('created')
        .reverse()
        .chunk(10)
        .value()
      );
    }
  }

  

  const textOverflow = {
    textAlign: 'left',
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "pre-line",
    display: "-webkit-box",
    WebkitLineClamp: "1",
    WebkitBoxOrient: "vertical"
  };
  
  try {

    return (
      <Card sx={{ maxWidth: '100%', border: 5, borderColor: boss?.flair?.color ?? '#FFF' }}>
        <CardHeader
          title={
            <>
              <Typography variant="span" className="boss-stars" style={{backgroundColor: boss?.flair?.color ?? '#FFF' }}>
                {boss?.bossClass ?? ''}
                {boss?.stars?.join('') ?? '★★★★★'}
              </Typography>
              <Typography variant="div" className="boss-health" style={{backgroundColor: boss?.flair?.color ?? '#FFF' }}>
                <FavoriteIcon /><span> {currentHealth}/{boss?.health?.maxHealth ?? 5000}</span>
              </Typography>
              <Box sx={{position: 'relative'}}>
                <Link href={boss?.permalink ?? ''} underline="none" target="_blank" rel="noreferrer" title={boss?.title ?? 'Missing Title'}>
                  <Typography gutterBottom  color="primary" variant="h5" component="div" 
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "pre-line",
                      display: "-webkit-box",
                      WebkitLineClamp: "1",
                      WebkitBoxOrient: "vertical",
                      width: '100%',
                      fontSize: '1.2rem'
                    }}
                  >
                    {boss?.title ?? 'Missing Title'}
                  </Typography>
                </Link>
                <i style={{ fontSize: '.8rem', position: 'absolute', bottom: '-30px', left: '50%', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', width: '100%'}}>{`By: ${boss.submittedBy}`}</i>
              </Box>
            </>
          }
        />
        <BorderLinearProgress variant="determinate" value={(currentHealth / boss?.health?.maxHealth ?? 5000) * 100} sx={{'& .MuiLinearProgress-bar1Determinate': {backgroundColor: boss?.flair?.color ?? '#FFF'}, borderRadius: '0px'}} ></BorderLinearProgress>
        <Flippy
          flipOnClick={false}
          isFlipped={expanded}
          flipDirection="horizontal"
        >
          <FrontSide style={{padding: 0}} sx={{position: 'relative'}}>
            <CardMedia
              component="img"
              height="200"
              width="100%"
              image={boss?.image ?? '/assets/backup.png'}
              alt={boss?.title}
            />
            <CardContent sx={{position: 'relative'}}>
              {storedPlayerName ? <>
                <Snackbar
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  open={showResult || playerNotice.show}
                  sx={{width: '100%'}}
                  autoHideDuration={10000}
                  >
                    <Alert
                        icon={false}
                        onClose={() => showResult ? setShowResult(false) : setPlayerNotice(defaultPlayerNotice)}
                        severity={showResult ? 'success' : playerNotice.severity}
                        variant={showResult ? 'outlined' : 'filled'}
                        sx={{ backgroundColor: showResult ? '#FFF' : '', position: 'relative', maxWidth: '100%' }}
                    >
                        {showResult ? <>
                          <AlertTitle><strong>Player Breakdown</strong></AlertTitle>
                          <ButtonGroup size="small" variant="text">
                            <Button disabled={resultFormat === 'summary'} onClick={() => setResultFormat('summary')}>Summary</Button>
                            <Button disabled={resultFormat === 'full'} onClick={() => setResultFormat('full')}>Full</Button>
                          </ButtonGroup>
                          {resultFormat === 'summary' ? 
                          <table className="resulttable">
                            <caption><strong>Remaining: </strong>{playerBossDetails.playerHealth}hp</caption>
                            <tbody>
                              <tr>
                                <th title="Dmg Dealt">💥</th><td>{playerBossDetails.damage}</td>
                                <th title="Dmg Taken">💘</th><td>{playerBossDetails.damageTaken ? `-${playerBossDetails.damageTaken}` : '🛡️'}</td>
                              </tr>
                              <tr>
                                <th title="Gold">💰</th><td>+{playerBossDetails.gold}</td>
                                <th title="Con XP">❤️</th><td>+{playerBossDetails.conXP}</td>
                              </tr>
                              <tr>
                                <th title="Class XP">{classIcon(playerBossDetails.className)}</th><td>+{playerBossDetails.classXP}</td>
                                <th title="RP">🏅</th><td>{playerBossDetails.rp ? `+${playerBossDetails.rp}` : playerBossDetails.rp}</td>
                              </tr>
                            </tbody>
                          </table> : <Markdown style={{overflow: 'auto', maxHeight: '250px', maxWidth: '100%' }}>{playerBossDetails?.botReply?.body ?? ''}</Markdown>}
                        </> : playerNotice.show ? <>
                        <AlertTitle><strong>Error!</strong></AlertTitle>
                        <strong>{playerNotice.message}</strong>
                        </> : ''}
                    </Alert>
                </Snackbar>
                {!playerBossDetails.loading ? <h4 style={{marginTop: 0}}>Your last attack:<br />{playerBossDetails.created ? <Moment fromNow>{playerBossDetails.created}</Moment> : '¯\\_(ツ)_/¯'}</h4> : ''}
                  {!playerBossDetails.loading ? 
                  <>
                    <Badge badgeContent={<IconButton disabled={playerBossDetails.waitingForBot || !playerBossDetails.command} onClick={() => setShowResult(!showResult)} color="secondary" aria-label="info" edge="start">{showResult ? <CancelTwoToneIcon sx={{bgcolor: '#FFF'}} /> : <InfoTwoToneIcon sx={{bgcolor: '#FFF'}} />}</IconButton>}>
                      <TextField 
                        variant="outlined" 
                        color='secondary'
                        value={playerBossDetails.command || 'No recent attacks!'} 
                        label={playerBossDetails.command ? <Button title="Open Last Comment" onClick={(e) => openLastComment(e, false)} variant="text" size='small'>Last comment <OpenInNewTwoToneIcon size="small" /></Button> : 'Last comment'}
                        name={`${boss.id}-comment`}
                        className="float"
                        disabled
                        InputLabelProps={{
                          style: { color: '#5F3E5F' },
                        }}
                        sx={{
                          marginTop: 0,
                          "& .MuiInputBase-root.Mui-disabled": {
                              "& > fieldset": {
                                  borderColor: "#5F3E5F",
                                  "& span button": {
                                    width: '100px'
                                  }
                              }
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            playerBossDetails.elementResult && !playerBossDetails.waitingForBot ? 
                            <>
                              <Divider orientation="vertical" flexItem color="secondary" />
                              <img src={`/assets/${playerBossDetails.element}.png`} alt={playerBossDetails.element} style={{backgroundSize: 24, height: 24, width: 24, marginLeft: 10}}/>
                              <span className="commentResult">{playerBossDetails.elementResult}</span>
                            </> : playerBossDetails.waitingForBot ? <><Divider orientation="vertical" flexItem color="secondary" /><Box sx={{marginLeft: '10px'}}><CircularProgress size="2rem" /></Box></> : ''
                          )
                        }}
                      />
                    </Badge>
                    <br/>
                    <ButtonGroup variant="outlined" aria-label="Copy actions" sx={{marginTop: '10px'}} className="float" size='small'>
                      {playerBossDetails.command ?
                        <CopyToClipboardButton 
                        text={playerBossDetails.command} 
                        title={playerBossDetails.command ? `Copy last command "${playerBossDetails.command}"`: 'Open boss to ATTACK!'} 
                        variant="outlined"/>
                        : ''
                      }
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        title={playerBossDetails.command ? `Copy last command "${playerBossDetails.command}" and open boss.`: 'Open boss to ATTACK!'}
                        onClick={(e) => handleCommandClick(e, boss.permalink, playerBossDetails.command)}>
                        {playerBossDetails.command ?
                          <><ContentCopyRoundedIcon /><ArrowForwardIcon /></>
                          : ''}
                        <RedditIcon sx={{color: '#ff4500'}} />
                      </Button>
                      {playerBossDetails.command ?
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          title={`Copy last command "${playerBossDetails.command}" and open last comment.`}
                          onClick={(e) => openLastComment(e, true)}>
                          <ContentCopyRoundedIcon size="small" /><ArrowForwardIcon size="small" /><OpenInNewTwoToneIcon size="small" color='primary' />
                        </Button>
                        : ''
                      }
                    </ButtonGroup> 
                  </> : <CircularProgress size="5rem" />}
              </> : 'Enter a username'}
            </CardContent>
          </FrontSide>
          <BackSide style={{ overflow: expanded ? 'auto': 'hidden', padding: 0}} id={`${boss.id}-backside`} >
            <CardContent sx={{position: 'relative'}}>
              <ButtonGroup fullWidth={true} size={'small'}>
                <IconButton
                  onClick={() => refreshBossComments(boss)}
                  size={"small"}
                >
                  {loadingComments ? <CircularProgress size="1rem" /> : <RefreshIcon /> }
                </IconButton>
                <IconButton size="small" onClick={() => closeAllComments()} disabled={!allBossComments.length}>
                  <CloseIcon />
                </IconButton>
                <Button sx={{borderRadius: '4px !important'}} onClick={() => getMyComments()} disabled={!allBossComments.length}>
                  Show {!showMe ? 'Me' : 'All'}
                </Button>
              </ButtonGroup>
              <Box style={{position: 'sticky', top: -1, zIndex:1000, backgroundColor: '#fff'}}>
                {!showMe && allBossComments.length > 1 ? <Stack alignItems="center"><Pagination sx={{margin: '5px 0'}} count={allBossComments.length} variant="outlined" shape="rounded" size={isMobile ? 'large' : 'small'} siblingCount={isMobile ? 0 : 1} boundaryCount={isMobile ? 1 : 0} onChange={handleCommentsPageChange} /></Stack> : ''}
              </Box>
              {expanded && allBossComments.length ? <>
                      {allBossComments[currentCommentPage].map((alert, aIndex) => (
                        <div key={alert.id} style={{marginTop: !aIndex ? '10px' : 0}} >
                          <Accordion 
                              variant="outlined" 
                              sx={{
                                color: getFlairColor(alert?.flairText), 
                                width: '100%', 
                                backgroundRepeat: 'no-repeat', 
                                backgroundPosition: 'center center',
                                backgroundImage: `radial-gradient(circle at center, rgba(${getFlairRGB(alert.bgColor)}, 0.6), rgba(${getFlairRGB(alert.bgColor)}, 1)), url(/assets/${getRaceImage(alert.flairText)}.png)`
                              }} 
                              disableGutters={true}
                              disabled={!alert?.replies?.at(0)?.body}
                              slotProps={{ transition: { unmountOnExit: true } }} 
                            >
                              <AccordionSummary 
                                sx={{
                                  position: 'sticky', 
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  alignItems: 'center',
                                  '& .MuiAccordionSummary-content': {
                                    width: '100%',
                                    marginBottom: 0
                                  }
                                }}
                                onClick={(e) => showReply(alert, alert?.replies?.at(0), [aIndex, 0])}
                                expandIcon={alert?.replies?.at(0)?.body ? <ExpandMoreIcon  /> : ''}
                              >
                                <Grid container spacing={0}>
                                  <Grid item xs={12}>
                                    <Typography sx={{textAlign: 'left', fontWeight: 'bold'}}>
                                      u/{alert.author} 
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sx={{textAlign: 'left', fontSize: '.7rem'}}>
                                      <i><Moment fromNow>{alert.created}</Moment></i>
                                  </Grid>
                                  <Grid item xs={12} sx={alert?.replies?.at(0)?.show ? {textAlign: 'left', fontSize: '.9rem'} : {...textOverflow, fontSize: '.9rem'}}  title={alert.body}>
                                    {alert.body}
                                  </Grid>
                                </Grid>
                              </AccordionSummary>
                              <AccordionDetails sx={{fontSize: '.8rem'}}>
                                <Markdown>{alert?.replies?.at(0)?.body}</Markdown>
                              </AccordionDetails>
                          </Accordion>
                          <hr />
                        </div>
                      ))}
                  </>: !loadingComments ? <Typography color={'#ccc'} variant="h5">Load comments</Typography> : <><Skeleton style={{margin: '5px 0'}} animation="wave" variant="rounded" width="100%" height={isMobile ? 40 : 30}></Skeleton><Stack spacing={1} divider={<Divider flexItem />}>
                    {[0,1,2,3,4,5,6,7,8,9].map(skelly => <Skeleton key={skelly} animation="wave" variant="rounded" width="100%" height={160}></Skeleton>)}
                  </Stack></>}
            </CardContent>
          </BackSide>
        </Flippy>
        <CardActions 
          
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            m: 0,
            p: 0
          }}>
          <Box>
            <table className="maxTable">
              <thead>
                <tr>
                  <th>💰</th><th style={{cursor: 'pointer'}} onClick={toggleMaxDmg}>💥</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{maxGold}</td><td>{includeMaxDmg ? maxDmg : <strike>{maxDmg}</strike>}</td>
                </tr>
              </tbody>
            </table>
          </Box>
          <Box sx={{margin: 'auto', marginLeft: 'auto !important'}}>
            <Stack
                direction="row"
                divider={<Divider orientation="vertical" flexItem />}
                spacing={1}
                justifyContent="center"
                alignItems="center"
                fontSize='2rem'
              >
              {(boss?.specials ?? []).map(special => (
              <Badge 
                badgeContent={boss.specialStats[special.letter].length} 
                color="secondary" 
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                overlap="circular"
                key={special.letter}
              >
                <span title={`${special.title}:\n${special.desc}`}>{special.icon}</span>
              </Badge>
              ))}
            </Stack>
          </Box>
          <Box>
            <ExpandMore
              expand={expanded}
              onClick={() => handleExpandClick()}
              aria-expanded={expanded}
              aria-label="Flip over for Live Comments"
              title="Flip over for Live Comments"
              size="large"
              edge="start"
              color="secondary"
            >
              <FlipIcon />
            </ExpandMore>
          </Box>
          
        </CardActions>

      </Card>
    );

  } catch(e) {
    console.log(e);
    return  (<div style={{color: '#FFF'}}>Error Loading Boss!</div>)
  }
};

export { BossDetails };