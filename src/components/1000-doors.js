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

const ThousandDoors = () => {

    const [ activeDoor, setDoor ] = useState('');
    const [ doors, updateDoors] = useState(Array.from({length: 1000}).map((d, id) => ({id: id+1, open: false, label: `Door ${id + 1}`})));
    const [ myOpenDoors, claimDoor ] = useState([]);
    const [ boots, setBoots ] = useState([{ id: 12345, used: false, door: null }])
    const [ phase, setPhase ] = useState(0);
    const [ open, openDoor ] = useState(false);

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
    }

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
            setPhase(1);
            setBoots(boots.slice(1));
            claimDoor([
                ...myOpenDoors,
                {
                    ...activeDoor,
                    opened: new Date()
                }
            ])
        } else {
            setPhase(0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <Grid container spacing={1} alignItems="top" justifyContent="center" style={{marginTop: '60px', color: '#FFF'}}>
            <Grid item lg={4} xl={4}>
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
            <Grid item lg={4} xl={4} alignItems="top" sx={{justifyContent: 'center'}}>
                <div style={{...doorImage, ...doorPhases[phase], position: 'relative'}}>
                    <span style={{position: 'absolute', top: '1%', left: '50%', transform: 'translate(-50%, 1%)', color: '#000', fontWeight: 'bolder', fontSize: '1.5rem'}}>{activeDoor?.id ?? ''}</span>
                    {phase === doorPhases.length - 1 ? <div style={{position: 'absolute', top: 'calc(50% + 30px)', left: '50%', transform: 'translate(-50%, -50%)'}}>
                        LOOT
                    </div> : <IconButton disabled={!activeDoor || (!boots.length && !phase)} sx={{position: 'absolute', top: 'calc(50% + 30px)', left: '50%', transform: 'translate(-50%, -50%)', fontSize: doorPhases?.at(phase)?.fontSize, color: 'gold', cursor: !activeDoor.open && boots.length ? 'url(/assets/misc/boot_cur.png) 50 50, pointer' : 'not-allowed' }} onClick={() => openDoor(!open)}>{doorPhases?.at(phase)?.icon}</IconButton>}
                </div><br />
                <Autocomplete
                    value={activeDoor}
                    disabled={!boots.length}
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
                            label="Doors"
                            disabled={!boots.length}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton disabled={!boots.length} sx={{color: '#FFF', position: 'absolute'}} onClick={randomDoor}><ShuffleIcon /></IconButton>
                                </InputAdornment>
                                ),
                            }}
                        />
                    }
                />
                <Box variant='h5' sx={{fontSize: '2rem', color: 'brown', margin: 0,display: 'flex', alignItems: 'top', flexWrap: 'wrap', justifyContent: 'center'}}><img alt="Boot" src={'/assets/misc/boot.png'} style={{width: '40px', marginRight: '10px'}} /> x{boots.length}</Box>
                Remaining Doors: {doors.filter(door => !door.open).length} {open}
            </Grid>
            <Grid item lg={4} xl={4} alignItems="top" sx={{justifyContent: 'center'}}>
                <Box variant="div" sx={{p: 6}}>
                    <Box variant="h4">My Open Doors</Box>
                    <Divider orientation="horizontal" flexItem sx={{backgroundColor: '#FFF', marginBottom: 3}} />
                    {myOpenDoors.map(door => 
                        <Accordion key={door.id} sx={{bgcolor: 'secondary.main'}}>
                            <AccordionSummary>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Box variant="h4">Door: {door.id}</Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Moment fromNow>{door.opened}</Moment>
                                    </Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                {door.loot}
                            </AccordionDetails>
                        </Accordion>
                    )}
                </Box>
            </Grid>
        </Grid>
    )
};

export { ThousandDoors };