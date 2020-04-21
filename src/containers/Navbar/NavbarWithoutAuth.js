import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { NEW_REQUEST_PATH } from 'constants/paths';
import styles from './Navbar.styles';

const useStyles = makeStyles(styles);

function NavbarWithoutAuth({ children }) {
  const classes = useStyles();
  const history = useHistory();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawerOpen = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const launchURL = (url) => {
    history.push(url);
    closeDrawer();
  };
  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar variant="dense">
        <Hidden only={['lg', 'xl', 'md']}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={toggleDrawerOpen}>
            <MenuIcon />
          </IconButton>
          <Drawer open={drawerOpen} onClose={toggleDrawerOpen}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              onClick={closeDrawer}
              className={classes.drawerHeader}>
              COVID-19 Assist
            </Typography>
            <Divider />
            <List>
              <ListItem
                onClick={() => {
                  launchURL(NEW_REQUEST_PATH);
                }}>
                <ListItemText primary="Request Assistance" />
              </ListItem>
              <ListItem
                onClick={() => {
                  launchURL('/search');
                }}>
                <ListItemText primary="Help Someone" />
              </ListItem>
              <ListItem
                onClick={() => {
                  launchURL('/');
                }}>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem
                onClick={() => {
                  launchURL('/donate');
                }}>
                <ListItemText primary="Donate" />
              </ListItem>
              <ListItem
                onClick={() => {
                  launchURL('/contact');
                }}>
                <ListItemText primary="Contact" />
              </ListItem>
              <ListItem
                onClick={() => {
                  launchURL('/about');
                }}>
                <ListItemText primary="About" />
              </ListItem>
            </List>
          </Drawer>
        </Hidden>

        <Typography variant="h6" color="inherit" noWrap>
          <Link to="/" className={classes.headerLink}>
            COVID-19 Assist
          </Link>
        </Typography>
        <div className={classes.grow} />
        <Hidden only={['sm', 'xs']}>
          <Button
            component={Link}
            to={NEW_REQUEST_PATH}
            color="inherit"
            variant="outlined">
            Request Assistance
          </Button>
          <Button component={Link} to="/search" color="inherit">
            Help Someone
          </Button>
          <Button component={Link} to="/donate" color="inherit">
            Donate
          </Button>
          <Button component={Link} to="/contact" color="inherit">
            Contact
          </Button>
          <Button component={Link} to="/about" color="inherit">
            About
          </Button>
        </Hidden>
        {children}
      </Toolbar>
    </AppBar>
  );
}

NavbarWithoutAuth.propTypes = {
  children: PropTypes.element,
};

export default NavbarWithoutAuth;
