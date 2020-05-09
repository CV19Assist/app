import React, { useState } from 'react';
import { useFirebaseApp } from 'reactfire';
import { Link, useHistory } from 'react-router-dom';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { makeStyles } from '@material-ui/core/styles';
import { USER_PROFILE_PATH, MY_REQUESTS_PATH } from 'constants/paths';

const useStyles = makeStyles(() => ({
  buttonRoot: {
    color: 'white',
  },
}));

function AccountMenu() {
  const classes = useStyles();
  const [anchorEl, setMenu] = useState(null);
  const history = useHistory();
  const firebase = useFirebaseApp();

  function closeAccountMenu() {
    setMenu(null);
  }
  function handleMenu(e) {
    setMenu(e.target);
  }
  async function handleLogout() {
    closeAccountMenu();
    await firebase.auth().signOut();
    history.replace('/');
  }

  return (
    <>
      <IconButton
        aria-owns={anchorEl ? 'menu-appbar' : null}
        aria-haspopup="true"
        onClick={handleMenu}
        classes={{ root: classes.buttonRoot }}>
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={closeAccountMenu}>
        <MenuItem
          component={Link}
          to={MY_REQUESTS_PATH}
          onClick={closeAccountMenu}>
          My Requests
        </MenuItem>
        <MenuItem
          component={Link}
          to={USER_PROFILE_PATH}
          onClick={closeAccountMenu}>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
      </Menu>
    </>
  );
}

export default AccountMenu;
