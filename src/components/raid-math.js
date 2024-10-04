import * as React from 'react';
import useSWR from 'swr';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import Moment from 'react-moment';
import { Container, Box, InputLabel, MenuItem, Select, AppBar, Tabs, Tab, FormControlLabel, Switch, TextField, FormControl, Stack, Chip, OutlinedInput, ListSubheader } from '@mui/material';


// created function to handle API request
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const baseDamgeLevels = [
  {min: 1,  max: 1,  dmg: 3.5 },
  {min: 2,  max: 2,  dmg: 4   },
  {min: 3,  max: 3,  dmg: 4.5 },
  {min: 4,  max: 4,  dmg: 5   },
  {min: 5,  max: 6,  dmg: 6   },
  {min: 7,  max: 8,  dmg: 6.5 },
  {min: 9,  max: 11, dmg: 7   },
  {min: 12, max: 14, dmg: 7.5 },
  {min: 15, max: 15, dmg: 8   },
  {min: 16, max: 20, dmg: 8.5 },
  {min: 21, max: 24, dmg: 9   },
  {min: 25, max: 27, dmg: 9.5 },
  {min: 28, max: 34, dmg: 10  },
  {min: 35, max: 44, dmg: 11  },
  {min: 45, max: 45, dmg: 11.5},
  {min: 46, max: 54, dmg: 12  },
  {min: 55, max: 58, dmg: 12.5},
  {min: 59, max: 64, dmg: 13  },
  {min: 65, max: 74, dmg: 13.5},
  {min: 75, max: 75, dmg: 14  },
  {min: 76, max: 84, dmg: 14.5},
  {min: 85, max: 86, dmg: 15  },
  {min: 87, max: 94, dmg: 15.5},
  {min: 95, max: 104,dmg: 16  },
  {min: 105,max: 114,dmg: 16.5},
  {min: 115,max: 124,dmg: 17  },
  {min: 125,max: 128,dmg: 17.5},
];

const baseDamageLookup = function(lvl) {
  return baseDamgeLevels.filter(base => base.min <= lvl && base.max >= lvl)[0].dmg;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Container>
          <Box>
              {children}
          </Box>
        </Container>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const a11yProps = function(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const RaidMath = () => {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [bloodLust, setBloodLust] = React.useState(false);
  const [weaponElements, setWpnElement] = React.useState({
    melee: [],
    range: [],
    magic: [],
  });

  const [weapons, setWeapon] = React.useState({
    melee: '',
    range: '',
    magic: '',
  });

  const [weaponDamages, setWpnDamge] = React.useState({
    melee: '',
    range: '',
    magic: '',
  });

  const [elementStrengths, setEleStrength] = React.useState({
    melee: 1.5,
    range: 1.5,
    magic: 1.5,
  });

  const calculateReact = function(tab) {
    let rawReact = Math.floor(((tab.baseDmg + (weaponDamages[tab.name]*elementStrengths[tab.name]))*(bloodLust ? 2 : 1))/5);
    if(rawReact <= 10) {
      return (<div style={{textAlign: 'center'}}><img src={'/assets/reacts/' + rawReact + '.svg'} alt={rawReact} style={{maxHeight: 100, maxWidth: '50%'}}/></div>)
    } else if(rawReact > 10) {
      return (<div style={{textAlign: 'center'}}><img src={'/assets/reacts/10.svg'} alt="10" style={{maxHeight: 100, maxWidth: '48%', display: 'inline-block'}}/> <img src={'/assets/reacts/' + rawReact.toString().split('')[1] + '.svg'} alt={rawReact} style={{maxHeight: 100, maxWidth: '48%', display: 'inline-block'}}/></div>)
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const handleWpnDmgChange = (event) => {
    setWpnDamge({
      ...weaponDamages,
      [event.target.name]: event.target.value,
    });
  };

  const handleEleStrengthChange = (event) => {
    setEleStrength({
      ...elementStrengths,
      [event.target.name]: event.target.value,
    });
  };

  let storedPlayerName = localStorage.getItem('storedPlayerName');

  window.addEventListener('kotdPlayerUpdate', () => {
    storedPlayerName = localStorage.getItem('storedPlayerName');
  });

  const lookupItems = (inventory, type) => {
    return inventory.filter(item => [type, '🎆'].includes(item.type.displayValue)).sort((a, b) => b.damage.sortValue - a.damage.sortValue).reduce((eleGroup, item) => {
      eleGroup[item.element.displayValue] = [
        ...(eleGroup[item.element.displayValue] || []),
        item
      ];
      return eleGroup;
    }, {})
  };

  const elementChange = (event, item) => {
    const [type] = event.target.name.split('-');
    setWeapon({
      ...weapons,
      [type]: ''
    });

    setWpnElement({
      ...weaponElements,
      [type]: event.target.value
    });
  };

  const handleWpnChange = (event) => {
    const [type] = event.target.name.split('-');
    setWeapon({
      ...weapons,
      [type]: event.target.value,
    });

    setWpnDamge({
      ...weaponDamages,
      [type]: +event.target.value.damage.sortValue,
    });
  };

  const {
    data: player,
    error,
    isValidating,
  } = useSWR(`https://api.spaghet.io/kotd/v1/player-details/${storedPlayerName}`, fetcher, { revalidateOnFocus: false});

  // Handles error and loading state
  if (error) return <div className='failed'>failed to load</div>;
  if (isValidating) return <div className="Loading">Loading...</div>;

  if(!storedPlayerName || player.notFound) return <h3>Enter a username</h3>
  
  const {
    levels: {
      melee,
      ranged,
      magic
    },
    inventory: {
      tables: {
        0: {
          tableRows: itemsInventory
        }
      },
      checked: lastChecked
    }
  } = player;

  let playerStats = [
    {
      title: 'Melee ⚔️', 
      name: 'melee',
      lvl: melee,
      baseDmg: baseDamageLookup(melee),
      wpnDmg: 0,
      items: lookupItems(itemsInventory, '⚔️')
    },
    {
      title: 'Range 🏹', 
      name: 'range', 
      lvl: ranged, 
      baseDmg: baseDamageLookup(ranged),
      wpnDmg: 0,
      items: lookupItems(itemsInventory, '🏹')
    },
    {
      title: 'Magic 🔮', 
      name: 'magic',
      lvl: magic, 
      baseDmg: baseDamageLookup(magic),
      wpnDmg: 0,
      items: lookupItems(itemsInventory, '🔮')
    }
  ];

  return (
    <>
      <h3 style={{color: '#FFFFFF'}}>Raid Math</h3>
      <Box sx={{ bgcolor: 'background.paper', width: 500, maxWidth: '98vw' }}>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
          >
            {playerStats.map((tab, index) => <Tab label={tab.title + ' (' + tab.lvl + ')'} {...a11yProps(index)} key={tab.title}/>)}
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          {playerStats.map((tab, index) => (
            <TabPanel component='div' value={value} index={index} dir={theme.direction} key={tab.title + index}>
              <Stack divider={<br/>} sx={{marginTop: 5}}>
                {itemsInventory.length ? 
                  <FormControl>
                    <InputLabel htmlFor="element-select">Element(s)</InputLabel>
                    <Select 
                      multiple 
                      value={weaponElements[tab.name] ?? ''} 
                      name={`${tab.name}-elements`} id="element-select" 
                      label="Element(s)" 
                      onChange={elementChange}
                      input={<OutlinedInput id="select-multiple-chip" label="Element(s)" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((element) => (
                            <Chip key={`${tab.name}-${element}-chip`} label={<img src={`/assets/elements/${element}.png`} alt={element} style={{backgroundSize: 20, height: 20, width: 20}} />} />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.keys(tab.items).filter(ele => ele !== 'Uknw').sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)).map(element => <MenuItem key={tab.name + element} value={element}><img src={`/assets/elements/${element}.png`} alt={element} style={{backgroundSize: 20, height: 20, width: 20}} /></MenuItem>)}
                    </Select>
                  </FormControl> : ''}
                  {itemsInventory.length ? 
                  <FormControl>
                    <InputLabel htmlFor="weapon-select"><>Inventory <small>(<Moment fromNow>{lastChecked}</Moment>)</small></></InputLabel>
                    <Select 
                    value={weapons[tab.name] ?? {}} 
                    id="weapon-select" 
                    name={`${tab.name}-weapons`} 
                    label={<>Inventory <small>(<Moment fromNow>{lastChecked}</Moment>)</small></>} disabled={!weaponElements[tab.name].length} 
                    onChange={handleWpnChange}
                    placeholder="Select Element"
                  > 
                      {weaponElements[tab.name]?.length ? Object.keys(tab.items).filter(ele => weaponElements[tab.name].includes(ele) || ele === 'Uknw').sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)).map(element => 
                      [
                        <ListSubheader sx={{textAlign: 'center', fontSize: '2rem'}}>{element === 'Uknw' ? '🎆' : <img src={`/assets/elements/${element}.png`} alt={element} style={{backgroundSize: 40, height: 40, width: 40}} />}</ListSubheader>,
                        tab.items[element].map((item, i) => <MenuItem key={`${item.id.displayValue}-${i}`} value={item}>ID{item.id.displayValue} | {item.name.displayValue} | {item.damage.displayValue}D | {+item.durability.sortValue}</MenuItem>)
                      ]) : ''} 
                    </Select>
                  </FormControl> : <strong>To see Inventory use "!inventory" or "!inventory --full"</strong>}
                <Stack direction={'row'} spacing={1}>
                  <TextField
                    label="Weapon Damage"
                    name={tab.name}
                    value={weaponDamages[tab.name]}
                    onChange={handleWpnDmgChange}
                  />
                  <TextField
                    disabled
                    label="Base Damage"
                    defaultValue={tab.baseDmg}
                  />
                </Stack>
                <FormControl>
                  <InputLabel id={tab.name + '-element-strength-label'}>Element Strength</InputLabel>
                  <Select
                    name={tab.name}
                    labelId={tab.name + '-element-strength-label'}
                    id={tab.name + '-element-strength'}
                    value={elementStrengths[tab.name]}
                    label="Element Strength"
                    onChange={handleEleStrengthChange}
                  >
                    <MenuItem value={1.5}>Weakness</MenuItem>
                    <MenuItem value={1}>Neutral</MenuItem>
                    <MenuItem value={.5}>Resist</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{margin: 'auto'}}>
                  <FormControlLabel
                      control={
                        <Switch checked={bloodLust} onChange={() => setBloodLust(!bloodLust)} name="bloodLust" />
                      }
                      label="Bloodlust"
                    />
                </FormControl>
                {calculateReact(tab)}
              </Stack>
            </TabPanel>
          ))}
        </SwipeableViews>
      </Box>
    </>
  );
};

export { RaidMath };