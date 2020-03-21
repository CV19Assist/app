import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from "@material-ui/core/CardActions";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Slider from '@material-ui/core/Slider';
import IconButton from '@material-ui/core/IconButton';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AnnouncementOutlinedIcon from '@material-ui/icons/AnnouncementOutlined';
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  },
  round: {
    borderRadius: 50,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indent: {
    marginLeft: theme.spacing(2),
  },
  icons: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  cards: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  arrows: {
    padding: theme.spacing(1.5),
    borderRadius: 100,
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
}));

const markValues = [
  {
    value: 1,
    label: '1 mi',
  },
  {
    value: 2,
    label: '2 mi',
  },
  {
    value: 5,
    label: '5 mi',
  },
  {
    value: 10,
    label: '10 mi',
  },
];

function SearchResults() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <main>
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Grid container spacing={3}>
              <Grid item xs={5}>
                <Card>
                  <List>
                    <ListItem>
                      <ListItemText primary="Your location..." />
                      <Button
                        variant="contained"
                        className={classes.round}
                      >
                        DETECT
                      </Button>
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              <Grid item xs></Grid>
              <Grid item xs={4} className={classes.center}>
                <Slider
                  defaultValue={5}
                  marks={markValues}
                  step={null}
                  min={1}
                  max={10}
                />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs className={classes.center}>
                <Button variant="contained" className={classes.arrows}>
                  {<ArrowDropUpIcon className={classes.icons} />}
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={3} direction="column">
              <Grid item xs>
                <Card className={classes.cards}>
                  <Grid container>
                    <Grid item xs={3} className={classes.center}>
                      <Typography variant="h4">2.5 mi</Typography>
                    </Grid>
                    <Divider orientation="vertical" flexItem />
                    <Grid item xs>
                      <CardContent>
                        <Typography variant="caption" gutterBottom>
                          ADDED 3/20/2020 @ 3:19 PM
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                          Soup drop off for quarantined new mild COVID-19 patient
                        </Typography>
                        <Typography variant="caption" gutterBottom>
                          REQUESTOR
                       </Typography>
                        <Typography variant="h6">William Johnson</Typography>
                      </CardContent>
                      <CardActions>
                        <div className={classes.indent}>
                          <Button>GRAB</Button>
                        </div>
                      </CardActions>
                    </Grid>
                    <Grid item xs={1}>
                      <Grid container direction="column">
                        <Grid item xs>
                          <IconButton>
                            <AnnouncementOutlinedIcon className={classes.icons} />
                          </IconButton>
                          <IconButton>
                            <ShoppingCartOutlinedIcon className={classes.icons} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} direction="column">
              <Grid item xs>
                <Card className={classes.cards}>
                  <Grid container>
                    <Grid item xs={3} className={classes.center}>
                      <Typography variant="h4">2.5 mi</Typography>
                    </Grid>
                    <Divider orientation="vertical" flexItem />
                    <Grid item xs>
                      <CardContent>
                        <Typography variant="caption" gutterBottom>
                          ADDED 3/20/2020 @ 3:19 PM
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                          Soup drop off for quarantined new mild COVID-19 patient
                        </Typography>
                        <Typography variant="caption" gutterBottom>
                          REQUESTOR
                       </Typography>
                        <Typography variant="h6">William Johnson</Typography>
                      </CardContent>
                      <CardActions>
                        <div className={classes.indent}>
                          <Button>GRAB</Button>
                        </div>
                      </CardActions>
                    </Grid>
                    <Grid item xs={1}>
                      <Grid container direction="column">
                        <Grid item xs>
                          <IconButton>
                            <AnnouncementOutlinedIcon className={classes.icons} />
                          </IconButton>
                          <IconButton>
                            <ShoppingCartOutlinedIcon className={classes.icons} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} direction="column">
              <Grid item xs>
                <Card className={classes.cards}>
                  <Grid container>
                    <Grid item xs={3} className={classes.center}>
                      <Typography variant="h4">2.5 mi</Typography>
                    </Grid>
                    <Divider orientation="vertical" flexItem />
                    <Grid item xs>
                      <CardContent>
                        <Typography variant="caption" gutterBottom>
                          ADDED 3/20/2020 @ 3:19 PM
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                          Soup drop off for quarantined new mild COVID-19 patient
                        </Typography>
                        <Typography variant="caption" gutterBottom>
                          REQUESTOR
                       </Typography>
                        <Typography variant="h6">William Johnson</Typography>
                      </CardContent>
                      <CardActions>
                        <div className={classes.indent}>
                          <Button>GRAB</Button>
                        </div>
                      </CardActions>
                    </Grid>
                    <Grid item xs={1}>
                      <Grid container direction="column">
                        <Grid item xs>
                          <IconButton>
                            <AnnouncementOutlinedIcon className={classes.icons} />
                          </IconButton>
                          <IconButton>
                            <ShoppingCartOutlinedIcon className={classes.icons} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs className={classes.center}>
                <Button variant="contained" className={classes.arrows}>
                  {<ArrowDropDownIcon className={classes.icons} />}
                </Button>
              </Grid>
            </Grid>
          </Container>
        </div>
      </main>
    </React.Fragment>
  );
}

export default SearchResults;
