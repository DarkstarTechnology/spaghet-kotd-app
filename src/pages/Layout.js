import { Outlet, Link } from "react-router-dom";
import { useState } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Box, CssBaseline, Divider, SwipeableDrawer, IconButton,
         List, ListItem, ListItemButton, Toolbar, Typography, useScrollTrigger,
         Slide, Menu, MenuItem, Button, ListSubheader  } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BackpackIcon from '@mui/icons-material/Backpack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalculateIcon from '@mui/icons-material/Calculate';
import CelebrationIcon from '@mui/icons-material/Celebration';
import DoorFrontTwoToneIcon from '@mui/icons-material/DoorFrontTwoTone';

import { Link as ReactRouterLink } from 'react-router-dom';
import { isMobile } from 'react-device-detect';

import "../App.css";
import { PlayerDetails, Announcements } from "../components";

function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired
};


const Layout = (props) => {

  const drawerWidth = 240;
  const pages = [
    {title: 'Boss List', to: '/boss-list', icon: <ViewModuleIcon style={{verticalAlign:'middle'}} />, loginRequired: false}, 
    {title: 'Shop', to: '/shop', icon: <ShoppingCartIcon style={{verticalAlign:'middle'}}  />, loginRequired: false}, 
    {title: 'Inventory', to: '/inventory', icon: <BackpackIcon style={{verticalAlign:'middle'}}  />, loginRequired: true}, 
    {title: 'Raid Math', to: '/raid', icon: <CalculateIcon style={{verticalAlign:'middle'}}  />, loginRequired: true}
  ];
  const thousandDoorReporters = [
    'SpaghetOG',
    'DejaV42',
    'numerousiceballs'
  ];
    
  const { window } = props;
  const [ mobileOpen, setMobileOpen] = useState(false);
  const [ storedPlayerName] = useState(localStorage.getItem('storedPlayerName') || false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const eventMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const eventMenuClose = () => {
    setAnchorEl(null);
  };


  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{color: '#FFF'}}>
      <Typography variant="h6" sx={{ my: 2, textAlign: 'center', margin: '0', bgcolor: 'primary.main', height: 65, lineHeight: '65px' }}>
        Spaghet KOTD v{process.env.REACT_APP_VERSION}
      </Typography>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.title} disablePadding>
            <ListItemButton component={ReactRouterLink} sx={{ textAlign: 'center' }} to={page.to} divider={true}>
              {page.icon} {page.title}
            </ListItemButton>
          </ListItem>
        ))}
        <ListSubheader sx={{fontWeight: 'bolder', bgcolor: 'primary.main', color: '#FFF'}}  divider={<Divider />}>Events</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton component={ReactRouterLink} sx={{ textAlign: 'center' }} to={'/1000doors'} divider={true}>
            <DoorFrontTwoToneIcon sx={{verticalAlign:'middle'}} />&nbsp;1000 Doors
          </ListItemButton>
        </ListItem>
        {storedPlayerName && thousandDoorReporters.includes(storedPlayerName) ?<ListItem disablePadding>
          <ListItemButton component={ReactRouterLink} sx={{ textAlign: 'center' }} to={'/1000doors/report'} divider={true}>
            <DoorFrontTwoToneIcon sx={{verticalAlign:'middle'}} />&nbsp;1000 Doors Report
          </ListItemButton>
        </ListItem> : ''}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar component="nav">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: {  xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}
            >
              Spaghet KOTD <small>v{process.env.REACT_APP_VERSION}</small>
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}>
              {pages.filter(page => page.loginRequired ? !!storedPlayerName : true).map((page) => (
                <Link component={ReactRouterLink} key={page.title} style={{color: '#FFF', margin: '10px', verticalAlign:'middle'}}  to={page.to}>
                  {page.icon} {page.title}
                </Link>
              ))}
            </Box>
            <Button
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={eventMenuClick}
              variant="text"
              sx={{color: '#FFF', display: {  xs: 'none', sm: 'none', md: 'none', lg: 'block' }}}
              >
                <CelebrationIcon  sx={{verticalAlign:'middle'}} />&nbsp;Events
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={eventMenuClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={eventMenuClose} >
                <Link component={ReactRouterLink} to={'/1000doors'} sx={{verticalAlign:'middle'}}>
                  <DoorFrontTwoToneIcon sx={{verticalAlign:'middle'}} />&nbsp;1000 Doors
                </Link>
              </MenuItem>
              {storedPlayerName && thousandDoorReporters.includes(storedPlayerName) ? <MenuItem onClick={eventMenuClose} >
                <Link component={ReactRouterLink} to={'/1000doors/report'} sx={{verticalAlign:'middle'}}>
                  <DoorFrontTwoToneIcon sx={{verticalAlign:'middle'}} />&nbsp;1000 Doors Report
                </Link>
              </MenuItem> : ''}
            </Menu>
            <Box sx={{ margin: 'auto'}}>
              <PlayerDetails />
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <nav>
        <SwipeableDrawer
          container={container}
          swipeAreaWidth={isMobile ? 40 : 0}
          minFlingVelocity={500}
          variant="temporary"
          open={mobileOpen}
          onOpen={handleDrawerToggle}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'secondary.main' }
          }}
        >
          {drawer}
        </SwipeableDrawer>
      </nav>
      <div className="App-base">
        <Announcements/>
        <Outlet/>
        <footer>
          <p style={{color: '#FF'}}>This tool is provided by u/SpaghetGaming for personal use as well as the KOTD Discord</p>
        </footer>
      </div>
    </>
  )
};

export default Layout;