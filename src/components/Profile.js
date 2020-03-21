import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ScheduleIcon from '@material-ui/icons/Schedule';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../modules/user';

const useStyles = makeStyles(theme => ({
  large: {
    width: theme.spacing(20),
    height: theme.spacing(20),
  },
  cards: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
  }
}));

function Profile() {
  const classes = useStyles();
  const user = useSelector(state => state.get("user"));
  const userProfile = user.get("userProfile");
  const authUser = user.get("authUser");
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <Container maxWidth="md">
        <Paper>
          <Grid container spacing={3} direction="column" alignItems="center">
            <Grid item xs>
              <Avatar className={classes.large}>
                <PersonIcon className={classes.large} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography
                component="h3"
                variant="h3"
                align="center"
                color="textPrimary"
                gutterBottom
              >
                {userProfile.get("displayName")}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography
                id="content-homepage"
                variant="h5"
                align="center"
                color="textSecondary"
                paragraph
              >
                {authUser.providerData[0].providerId}
              </Typography>
            </Grid>
          </Grid>
          <Container maxWidth="md">
            <Card className={classes.cards}>
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <Badge color="primary" badgeContent={1}>
                      <ScheduleIcon />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary="Tasks in Progress" />
                  <ListItemIcon>
                    <ChevronRightIcon />
                  </ListItemIcon>
                </ListItem>
                <Divider variant="middle" light />
                <ListItem button>
                  <ListItemIcon>
                    <AssignmentTurnedInIcon />
                  </ListItemIcon>
                  <ListItemText primary="Completed Tasks" />
                  <ListItemIcon>
                    <ChevronRightIcon />
                  </ListItemIcon>
                </ListItem>
              </List>
            </Card>
            <Card className={classes.cards}>
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                  <ListItemIcon>
                    <ChevronRightIcon />
                  </ListItemIcon>
                </ListItem>
                <Divider variant="middle" light />
                <ListItem button>
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary="Help &amp; feedback" />
                  <ListItemIcon>
                    <ChevronRightIcon />
                  </ListItemIcon>
                </ListItem>
              </List>
            </Card>
            <Card className={classes.cards}>
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                  <ListItemIcon>
                    <ChevronRightIcon />
                  </ListItemIcon>
                </ListItem>
              </List>
            </Card>
            <div className={classes.buttons}>
              <Button
                variant="outlined"
                onClick={() => dispatch(logout())}
              >
                Logout
              </Button>
            </div>
          </Container>
        </Paper>
      </Container>
    </React.Fragment>
  );
}

export default Profile;