/* eslint-disable no-unused-vars */
import useSWR from 'swr';
import { useState, useRef, useEffect, memo } from 'react';
import { Typography, Button, Box, Paper, AppBar, Tabs, Tab, Container, Popper, Grid } from '@mui/material';
import PropTypes from 'prop-types';
import { DataGrid, GridToolbarContainer  } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import Moment from 'react-moment';
import moment from 'moment';

moment.relativeTimeThreshold('m', 60);

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

function isOverflown(element) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

const GridCellExpand = memo(function GridCellExpand(props) {
  const { width, value } = props;
  const wrapper = useRef(null);
  const cellDiv = useRef(null);
  const cellValue = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFullCell, setShowFullCell] = useState(false);
  const [showPopper, setShowPopper] = useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent) {
      if (nativeEvent.key === 'Escape') {
        setShowFullCell(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <Box
      ref={wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        alignItems: 'center',
        lineHeight: '24px',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
      }}
    >
      <Box
        ref={cellDiv}
        sx={{
          height: '100%',
          width,
          display: 'block',
          position: 'absolute',
          top: 0,
        }}
      />
      <Box
        ref={cellValue}
        sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {value}
      </Box>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl !== null}
          anchorEl={anchorEl}
          style={{ width, marginLeft: -17 }}
        >
          <Paper
            elevation={1}
            style={{ minHeight: wrapper.current.offsetHeight - 3 }}
          >
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </Box>
  );
});

function renderCellExpand(params) {
  return (
    <GridCellExpand value={params.value || ''} width={params.colDef.computedWidth} />
  );
}

const ThousandDoorsReport = () => {

    const [ storedPlayerName ] = useState(localStorage.getItem('storedPlayerName') || '');
    const [ loading, loadingData ] = useState(true);
    const [ allBoots, setAllBoots ] = useState([]);
    const [ pendingLoot, needsDelivered ] = useState([]);
    const [ deliveredLoot, deliverLoot ] = useState([]);
    const [ deliveryQueue, queDelivery ] = useState([]);
    const [ activeTab, changeTab ] = useState(0);
    const theme = useTheme();

    const doorImage = {
      backgroundImage: 'url(/assets/misc/dungeon_doors.png)',
      backgroundSize: '400px',
      backgroundRepeat: 'no-repeat',
      height: '66.6px',
      width: '60px',
  };

  const doorPhases = [
    {
        backgroundPosition: '-22px -20px',
    },
    {
        backgroundPosition: '-236.6px -20px',
    }
  ];

    const pendingColumns = [
        {
            field: 'number',
            headerName: 'Door',
            width: 100
        },
        {
            field: 'player',
            headerName: 'Player',
            valueGetter: (value, row) => value.player,
            width: 200
        },
        {
            field: 'authorizedBy',
            headerName: 'Authorized By',
            width: 200
        },
        {
            field: 'loot',
            headerName: 'Loot',
            width: 200,
            renderCell: renderCellExpand
        },
        {
            field: 'kicked',
            headerName: 'Kicked',
            valueGetter: (value, row) => new Date(row.kicked),
            type: 'date',
            width: 150
        }
    ];
    const deliveredColumns = [
        {
            field: 'number',
            headerName: 'Door',
            width: 100
        },
        {
            field: 'player',
            headerName: 'Player',
            valueGetter: (value, row) => row.player.player,
            width: 200
        },
        {
            field: 'loot',
            headerName: 'Loot',
            width: 200,
            renderCell: renderCellExpand
        },
        {
            field: 'deliveredBy',
            headerName: 'Delivered By',
            width: 200
        },
        {
            field: 'delivered',
            headerName: 'Delivered',
            valueGetter: (value, row) => new Date(row.delivered),
            type: 'date',
            width: 150
        }
    ];
    const unwornColumns = [
        {
            field: 'player',
            headerName: 'Player',
            width: 200
        },
        {
            field: 'authorizedBy',
            headerName: 'Authorized By',
            width: 200
        },
        {
            field: 'cobbled',
            headerName: 'Cobbled',
            valueGetter: (value, row) => new Date(row.cobbled),
            type: 'date',
            width: 150
        }
    ];

    const fetcher = (...args) => {
        return fetch(...args, {method: 'POST', body: JSON.stringify({player: storedPlayerName})}).then((res) => res.json())
    };
    
    const distributeData = ({pendingDelivery = [], delivered = [], allBoots = []}) => {
        needsDelivered(pendingDelivery);
        deliverLoot(delivered);
        setAllBoots(allBoots);
        loadingData(false);
    };

    const handleChange = (event, newValue) => {
        changeTab(newValue);
    };
  
    const handleChangeIndex = (index) => {
        changeTab(index);
    };

    const markDelivered = (selectedRows) => {
        fetch("https://api.spaghet.io/kotd/v1/event/1000Doors/deliverLoot", {
            method: "POST",
            body: JSON.stringify({
                deliveryQueue,
              deliveredBy: storedPlayerName
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
          }).then((res) => res.json()).then(res => {
            const toBeDelivered = pendingLoot.filter(row => selectedRows.includes(row.number)).map(row => ({...row, delivered: new Date().toDateString(), deliveredBy: storedPlayerName}));
                deliverLoot(
                    deliveredLoot.concat(toBeDelivered)
                );
                needsDelivered(
                    pendingLoot.filter(row => !selectedRows.includes(row.number))
                )
          });
    };

    const reportTabs = [
        {
            title: 'Pending Delivery',
            count: pendingLoot.length,
            component: <DataGrid
                loading={loading}
                getRowId={row => row?.number ?? Math.random()}
                slotProps={{
                  loadingOverlay: {
                    variant: 'skeleton',
                    noRowsVariant: 'skeleton',
                  },
                }}
                slots={{
                    toolbar: () => <GridToolbarContainer>
                        <Button sx={{margin: 1}} variant="contained" color="primary" disabled={!deliveryQueue?.length} onClick={() => markDelivered(deliveryQueue)} startIcon={<DoneAllIcon />}>Mark {deliveryQueue?.length} Delivered</Button>
                    </GridToolbarContainer>
                }}
                disableRowSelectionOnClick
                autoheight
                rows={pendingLoot}
                columns={pendingColumns}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } }}}
                pageSizeOptions={[5, 10, 25]}
                checkboxSelection
                onRowSelectionModelChange={queDelivery}
                rowSelectionModel={deliveryQueue}
                sx={{ border: 0, height: 450 }}
            />
        },
        {
            title: 'Delivered',
            count: deliveredLoot.length,
            component: <DataGrid
                autoheight
                getRowId={row => row?._id ?? Math.random()}
                rows={deliveredLoot}
                columns={deliveredColumns}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 6 } } }}
                pageSizeOptions={[6, 12, 24]}
                sx={{ border: 0, height: 450 }}
            />
        },
        {
            title: 'Unworn',
            count: allBoots.length - (deliveredLoot.length + pendingLoot.length),
            component: <DataGrid
                autoheight
                getRowId={row => row?._id ?? Math.random()}
                rows={allBoots.filter(boot => !boot.worn)}
                columns={unwornColumns}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 6 } } }}
                pageSizeOptions={[6, 12, 24]}
                sx={{ border: 0, height: 450 }}
            />
        }
    ];
    
  const {
    error,
    isValidating,
  } = useSWR(`https://api.spaghet.io/kotd/v1/event/1000Doors/report`, fetcher, { onSuccess: distributeData, revalidateOnFocus: false});

    return (
      <Box sx={{ margin: '10 auto', paddingTop: 5 }}>
        <Grid 
        container
        direction="row"
        sx={{
          justifyContent: "space-evenly",
          alignItems: "center",
          alignContent: 'center',
          marginBottom: 5
        }}>
        <Grid item xs={4}>
            <div style={{...doorImage, ...doorPhases[0], position: 'relative', margin: 'auto'}}>
                <Typography variant='h5' sx={{color: '#FFF', position: 'absolute', top: 'calc(50%)', left: '50%', transform: 'translate(-50%, -50%)'}}>{loading ? '...' : 1000 - (deliveredLoot.length + pendingLoot.length)}</Typography>
            </div>
          </Grid>
          <Grid item xs={4}>
            <div style={{...doorImage, ...doorPhases[1], position: 'relative', margin: 'auto'}}>
            <Typography variant='h5' sx={{color: '#FFF', position: 'absolute', top: 'calc(50%)', left: '50%', transform: 'translate(-50%, -50%)'}}>{loading ? '...' : deliveredLoot.length + pendingLoot.length}</Typography>
            </div>
          </Grid>
          <Grid item xs={4} sx={{position: 'relative'}}>
            <img alt="Boot" src={'/assets/misc/boot.png'} style={{width: '60px', marginRight: '10px', margin: 'auto'}} />
            <Typography variant='h5' sx={{color: '#FFF', position: 'absolute', top: 'calc(50%)', left: '50%', transform: 'translate(-50%, -50%)'}}>{loading ? '...' : allBoots.length}</Typography>
          </Grid>
        </Grid>
            <AppBar position="static">
                <Tabs
                    value={activeTab}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    centered
                >
                    {reportTabs.map((tab, index) => <Tab label={`${tab.title} (${tab.count})`} {...a11yProps(index)} key={tab.title}/>)}
                </Tabs>
            </AppBar>
            {reportTabs.map((tab, index) => (
                <TabPanel style={{backgroundColor: '#FFF'}} sx={{ display: 'flex', flexDirection: 'column', maxHeight: 700 }} component='div' value={activeTab} index={index} dir={theme.direction} key={tab.title + index}>
                    {tab.component}
                </TabPanel>
            ))}
        </Box>
    )
};

export { ThousandDoorsReport };