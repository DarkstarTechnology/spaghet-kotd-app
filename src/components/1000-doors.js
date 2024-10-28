/* eslint-disable no-unused-vars */
import useSWR from 'swr';
import { useState, useRef, useEffect, Fragment } from 'react';
import { styled, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, 
    IconButton, Typography, TextField, 
    Button, ButtonGroup, Stack, Divider, Link, LinearProgress, 
    linearProgressClasses, Box, Alert, AlertTitle, Pagination, 
    Snackbar, Skeleton, Badge, CircularProgress, Grid, 
    Accordion, AccordionSummary, AccordionDetails, AccordionActions, Autocomplete, InputAdornment   } from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import HttpsIcon from '@mui/icons-material/Https';

import Moment from 'react-moment';
import moment from 'moment';

moment.relativeTimeThreshold('m', 60);

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const ThousandDoors = () => {

    const [ activeDoor, setDoor ] = useState('');
    const [ doors, updateDoors] = useState([]);
    const [ myOpenDoors, claimDoor ] = useState([]);
    const [ boots, setBoots ] = useState([]);
    const [ storedPlayerName ] = useState(localStorage.getItem('storedPlayerName') || '');
    const [ phase, setPhase ] = useState(0);
    const [ open, openDoor ] = useState(false);
    const [ kicking, kickingDoor ] = useState(false);
    const [ doorError, newError ] = useState({show: false, message: ''});

    const doorImage = {
        backgroundImage: 'url(/assets/misc/dungeon_doors.png)',
        backgroundSize: '2000px',
        backgroundRepeat: 'no-repeat',
        height: '333px',
        width: '300px',
        margin: 'auto'
    };
    
    const doorPhases = [
        {
            backgroundPosition: '-110px -100px',
            fontSize: '100px',
            icon: <HttpsIcon fontSize="" />
        },
        {
            backgroundPosition: '-463px -100px',
            fontSize: '100px',
            icon: '💥'
        },
        {
            backgroundPosition: '-821px -100px',
            fontSize: '200px',
            icon: '💥'
        },
        {
            backgroundPosition: '-1183px -100px',
        }
    ];

    const autocompleteStyle = { 
        margin: 'auto',
        maxWidth: '300px',
        width: '100%',
        '& .MuiFormControl-root': {
            '& .MuiFormLabel-root': {
                color: '#FFF'
            } 
        },
        '& .MuiFormControl-root.Mui-disabled': {
            '& .MuiFormLabel-root': {
                color: '#FFF'
            } 
        },
        "& .MuiInputBase-root.Mui-disabled": {
            "& .MuiInputBase-input": {
                color: '#FFF',
            },
            '& fieldset': {
                borderColor: '#FFF',
                color: '#FFF'
            }
        },
        "& .MuiInputBase-root": {
            "& .MuiInputBase-input": {
                color: '#FFF',
            },
            '& fieldset': {
                borderColor: '#FFF',
                color: '#FFF'
            }
        },
        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFF',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFF'
        },
        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFF'
        },
    };

    const randomDoor = () => {
        openDoor(false);
        const closedDoors = doors.filter(door => !door.open);
        const randomDoor = Math.floor(Math.random() * (doors.length - 1));
        setDoor(closedDoors.at(randomDoor));
    };

    const phaseDoor = () => {
        setPhase(phase === doorPhases.length - 1 ? 0 : phase + 1);
    };

    useEffect(() => {
        const endPhase = phase === doorPhases.length - 1;
        if(phase && !endPhase) {
            setTimeout(phaseDoor, 100);
        }

        if(endPhase) {
            updateDoors([
                ...doors.filter(door => door.id !== activeDoor.id),
                {
                    ...activeDoor,
                    open: true
                }
            ])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);
  
    useEffect(() => {
        if(open) {
            kickingDoor(true);
            fetcher(`https://api.spaghet.io/kotd/v1/event/1000Doors/kickDoor`, {method: 'POST', body: JSON.stringify({player: storedPlayerName, door: activeDoor.id})}).then((door) => {
                const {doorKicked, loot, message = ''} = door;
                kickingDoor(false);
                if(doorKicked) {
                    setPhase(1);
                    setBoots(boots.slice(1));
                    setDoor({
                        ...activeDoor,
                        loot
                    });
                    claimDoor([
                        ...myOpenDoors,
                        door
                    ]);
                } else {
                    newError({
                        show: true,
                        message
                    });
                }
              });
        } else {
            setPhase(0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const distributeData = ({playerDoors, playerBoots, availableDoors}) => {
        claimDoor(playerDoors);
        setBoots(playerBoots);
        updateDoors(availableDoors);
    }

    
  const {
    error,
    isValidating,
  } = useSWR(`https://api.spaghet.io/kotd/v1/event/1000Doors/${storedPlayerName}`, fetcher, { onSuccess: distributeData, revalidateOnFocus: false});

  if(!storedPlayerName) return <h3 style={{color: '#FFFFFF'}}>Enter a username to see this event!!</h3>

    return (
        <Grid container spacing={1} alignItems="top" justifyContent="center" style={{color: '#FFF'}}>
            <Grid item lg={4} xl={4} md={12} sm={12} xs={12}>
                <Box variant="div" sx={{p: 6}}>
                    <Box variant="h4">Event Details</Box>
                    <Divider orientation="horizontal" flexItem sx={{backgroundColor: '#FFF', marginBottom: 3}} />
                    <Box variant="p">
                        They say in life if one door opens another one closes, but in KOTD we do not open doors, we kick them! As such one door is too little, I present to you a 1000 doors. Proudly sponsored by the STUPID-fund, should you get a kill or win other small events, you shall get a magical boot…. a tool used to "open" a door of your choice.
                    </Box>
                    <Box variant="p" sx={{margin: '10px 0 10px 0'}}>
                        A BOOT is needed to OPEN any one of these 1000 doors. Behind them awaits a wonderful prize, chosen at random, from wonderful gestures to questionable "prizes", from gold to more gold, everything is behind these doors!
                    </Box>
                    <Box variant="p">
                        <i>So what are you waiting for? Join your closest raid and kick the door of your dreams today!</i>
                    </Box>
                </Box>
            </Grid>
            <Grid item lg={4} xl={4} md={6} sm={12} xs={12} alignItems="top" sx={{justifyContent: 'center'}}>
                <div style={{...doorImage, ...doorPhases[phase], position: 'relative'}}>
                    <span style={{position: 'absolute', top: '1%', left: '50%', transform: 'translate(-50%, 1%)', color: '#000', fontWeight: 'bolder', fontSize: '1.5rem'}}>{activeDoor?.id ?? ''}</span>
                    {phase === doorPhases.length - 1 ? <div style={{position: 'absolute', top: 'calc(50% + 30px)', left: '50%', transform: 'translate(-50%, -50%)'}}>
                        {activeDoor.loot}
                    </div> : <IconButton disabled={kicking || !activeDoor || (!boots.length && !phase)} sx={{position: 'absolute', top: 'calc(50% + 30px)', left: '50%', transform: 'translate(-50%, -50%)', fontSize: doorPhases?.at(phase)?.fontSize, color: 'gold', cursor: activeDoor && boots.length ? 'url(/assets/misc/boot_cur.png) 50 50, pointer' : 'not-allowed' }} onClick={() => openDoor(!open)}>{doorPhases?.at(phase)?.icon}</IconButton>}
                </div>
                {doorError.show ? <Alert
                        onClose={() => newError({...doorError, show: false})}
                        severity={'error'}
                        variant={'filled'}
                        sx={{
                            margin: '10px auto',
                            maxWidth: '300px'
                        }}
                    >
                        <AlertTitle sx={{fontWeight: 'bolder'}}>Door NOT Kicked!!</AlertTitle>
                        {doorError.message}
                    </Alert> : <br />}
                <Autocomplete
                    value={activeDoor}
                    disabled={!boots.length || kicking}
                    isOptionEqualToValue={(data) => true}
                    getOptionDisabled={(door) => door.open}
                    onChange={(event, newValue) => {
                        openDoor(false)
                        if(newValue) {
                            setDoor(newValue);
                        } else {
                            setDoor('');
                        }
                    }}
                    options={doors}
                    sx={autocompleteStyle}
                    renderInput={(params) => 
                        <TextField 
                            {...params} 
                            label={boots.length ? 'Select Door' : 'No Boots ):'}
                            disabled={!boots.length}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton title={'Random Door'} disabled={!boots.length} sx={{color: '#FFF', position: 'absolute'}} onClick={randomDoor}><ShuffleIcon /></IconButton>
                                </InputAdornment>
                                ),
                            }}
                        />
                    }
                />
                <Box variant='h5' sx={{fontSize: '2rem', color: 'brown', marginTop: 2,display: 'flex', alignItems: 'top', flexWrap: 'wrap', justifyContent: 'center'}}><img alt="Boot" src={'/assets/misc/boot.png'} style={{width: '40px', marginRight: '10px'}} /> x{boots.length}</Box>
                {/* Remaining Doors: {doors.filter(door => !door.open).length} {open} */}
            </Grid>
            <Grid item lg={4} xl={4} md={6} sm={12} xs={12} alignItems="top" sx={{justifyContent: 'center'}}>
                <Box variant="div" sx={{p: 6}}>
                    <Box variant="h4">My Kicked Doors</Box>
                    <Divider orientation="horizontal" flexItem sx={{backgroundColor: '#FFF', marginBottom: 3}} />
                    {myOpenDoors?.map(door => 
                        <Accordion key={door.id} sx={{bgcolor: 'secondary.main'}}>
                            <AccordionSummary>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Box variant="h4">Door: {door.id}</Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Moment fromNow>{door.kicked}</Moment>
                                    </Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div style={{...doorImage, ...doorPhases[3], position: 'relative'}}>
                                    <span style={{position: 'absolute', top: '1%', left: '50%', transform: 'translate(-50%, 1%)', color: '#000', fontWeight: 'bolder', fontSize: '1.5rem'}}>{door?.id ?? ''}</span>
                                    <div style={{color: '#FFF', position: 'absolute', top: 'calc(50% + 30px)', left: '50%', transform: 'translate(-50%, -50%)'}}>
                                        {door.loot}
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {!myOpenDoors?.length ? <h4>Your kicked doors will appear here</h4> : ''}
                </Box>
            </Grid>
        </Grid>
    )
};

export { ThousandDoors };