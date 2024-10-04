import { Outlet, Link } from "react-router-dom";
import { useState } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Box, CssBaseline, Divider, SwipeableDrawer, IconButton,
         List, ListItem, ListItemButton, Toolbar, Typography, useScrollTrigger,
         Slide, } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BackpackIcon from '@mui/icons-material/Backpack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalculateIcon from '@mui/icons-material/Calculate';

import { Link as ReactRouterLink } from 'react-router-dom';
import { BrowserView, isMobile } from 'react-device-detect';

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
    {title: 'Inventory', to: '/inventory', icon: <BackpackIcon style={{verticalAlign:'middle'}}  />, loginRequired: true}, 
    {title: 'Shop', to: '/shop', icon: <ShoppingCartIcon style={{verticalAlign:'middle'}}  />, loginRequired: false}, 
    {title: 'Raid Math', to: '/raid', icon: <CalculateIcon style={{verticalAlign:'middle'}}  />, loginRequired: true}
  ];
    
  const { window } = props;
  const [ mobileOpen, setMobileOpen] = useState(false);
  const [ storedPlayerName] = useState(localStorage.getItem('storedPlayerName') || false);


  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{color: '#FFF'}}>
      <Typography variant="h6" sx={{ my: 2, textAlign: 'center', margin: '0', bgcolor: 'primary.main', height: 56, lineHeight: '56px' }}>
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
      </List>
      {isMobile && storedPlayerName ? <Box sx={{ margin: 'auto'}}><PlayerDetails /></Box> : ''}
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
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              Spaghet KOTD v{process.env.REACT_APP_VERSION}
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {pages.filter(page => page.loginRequired ? !!storedPlayerName : true).map((page) => (
                <Link component={ReactRouterLink} key={page.title} style={{color: '#FFF', margin: '10px', verticalAlign:'middle'}}  to={page.to}>
                  {page.icon} {page.title}
                </Link>
              ))}
            </Box>
            <BrowserView>
              <Divider orientation="vertical" flexItem sx={{xs: 'none', sm: 'block', opacity: "0.6", backgroundColor: '#FFF'}} />
            </BrowserView>
            <Box sx={{ margin: 'auto'}}>
              {isMobile && !storedPlayerName ? <PlayerDetails /> : <BrowserView><PlayerDetails /></BrowserView>}
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <nav>
        <SwipeableDrawer
          container={container}
          swipeAreaWidth={40}
          minFlingVelocity={500}
          variant="temporary"
          open={mobileOpen}
          onOpen={handleDrawerToggle}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
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