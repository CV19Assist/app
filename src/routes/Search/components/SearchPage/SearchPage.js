import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
// import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
// import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
// import TextField from '@material-ui/core/TextField';
// import CardContent from '@material-ui/core/CardContent';
import Slider from '@material-ui/core/Slider';
// import Chip from '@material-ui/core/Chip';
// import Autocomplete from '@material-ui/lab/Autocomplete';
// import LinearProgress from '@material-ui/core/LinearProgress';
// import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
// import { useLocation } from 'react-router-dom';
// import { allCategoryMap } from '../util/categories';
import styles from './SearchPage.styles';

const useStyles = makeStyles(styles);

const markValues = [
  { value: 1, label: '1 mi' },
  // { value: 2, label: '2 mi', },
  // { value: 5, label: '5 mi', },
  // { value: 20, label: '20 mi', },
  { value: 30, label: '30 mi' },
  // { value: 50, label: '50 mi', },
  // { value: 90, label: '90 mi', },
];

// Default distance in miles.
const defaultDistance = 25;

function SearchPage() {
  const classes = useStyles();
  // const location = useLocation();
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [distance, setDistance] = useState(defaultDistance);
  console.log('Distance', { distance }); // eslint-disable-line no-console

  // const handlePlaceSelect = (event, selection) => {
  //   console.log('Place select', { event, selection }); // eslint-disable-line no-console
  // };

  const handleTriggerSearchResults = () => {
    console.log('handleTriggerSearchResults'); // eslint-disable-line no-console
    // const filter = {
    //   lat: currentPlaceLatLng.lat,
    //   lng: currentPlaceLatLng.lng,
    //   distance: distance,
    //   units: "mi"
    // };
  };

  // const handleCopyNeedLink = (id) => {
  //   const el = document.createElement('textarea');
  //   document.body.appendChild(el);
  //   el.value = `${location.origin}/needs/${id}`;
  //   el.select();
  //   document.execCommand('copy');
  //   document.body.removeChild(el);
  // };

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Find Opportunities</title>
      </Helmet>
      <Typography variant="h6">Search Criteria</Typography>
      <Paper className={classes.filterPaper}>
        {!showAddressPicker && (
          <Typography id="continuous-slider" gutterBottom>
            Using your default location.
            <Button onClick={() => setShowAddressPicker(true)}>
              Select new location
            </Button>
          </Typography>
        )}

        <Divider className={classes.divider} />

        <Typography id="continuous-slider" gutterBottom>
          Distance (in miles)
        </Typography>
        <div className={classes.distance}>
          <Slider
            defaultValue={defaultDistance}
            valueLabelDisplay="on"
            // valueLabelFormat={x => `${x} mi`}
            marks={markValues}
            onChange={(event, value) => setDistance(value)}
            // step={null}
            min={1}
            max={30}
          />
        </div>

        <Divider className={classes.divider} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleTriggerSearchResults}>
          Search
        </Button>
      </Paper>
      {/* {searchStatus === 'loading' && (
        <Card className={classes.cards}>
          <CardContent>
            <LinearProgress />
          </CardContent>
        </Card>
      )}
      {!results && searchStatus !== 'loading' && (
        <Card className={classes.cards}>
          <CardContent>
            <Typography>No results.</Typography>
          </CardContent>
        </Card>
      )}
      {results !== null && results.length === 0 && (
        <Card className={classes.cards}>
          <CardContent>
            <Typography>
              No requests found. You can try expanding the search area.
            </Typography>
          </CardContent>
        </Card>
      )} */}
      {/* {results &&
        results.map((result) => (
          <Card key={result.id} className={classes.cards}>
            <Container maxWidth="lg" className={classes.TaskContainer}>
              <Grid container>
                <Grid item xs={9}>
                  <Typography variant="caption" gutterBottom>
                    ADDED {result.createdAt.format('llll')}
                  </Typography>
                  <Typography
                    variant="h5"
                    className={classes.TaskTitle}
                    gutterBottom>
                    {result.needs.map((item) => (
                      <React.Fragment key={item}>
                        {allCategoryMap[item] ? (
                          <Chip label={allCategoryMap[item].shortDescription} />
                        ) : (
                          <Alert severity="error">
                            Could not find '{item}' in all category map.
                          </Alert>
                        )}
                        <br />
                      </React.Fragment>
                    ))}
                  </Typography>
                </Grid>

                {parseInt(result.immediacy) > 5 && (
                  <Grid item xs={3}>
                    <img
                      align="right"
                      src="/taskIcon.png"
                      width="50px"
                      height="50px"
                      alt="Urgent"
                      title="Urgent"
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="caption" gutterBottom>
                    REQUESTOR
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="h6">
                    {result.name ? result.name : result.firstName}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    align="right"
                    variant="h5"
                    className={classes.TaskTitle}>
                    {(result.distance * 0.62137).toFixed(2)} miles
                  </Typography>
                </Grid>

                <Grid
                  className={classes.DetailsButton}
                  align="right"
                  item
                  xs={12}>
                  {navigator.share ? (
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => {
                        navigator.share({
                          title: 'CV19 Assist Need Link',
                          text: 'CV19 Assist Need Link',
                          url: `${location.origin}/needs/${result.id}`,
                        });
                      }}>
                      SHARE
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => handleCopyNeedLink(result.id)}>
                      COPY LINK FOR SHARING
                    </Button>
                  )}{' '}
                  <Button variant="contained" color="primary">
                    DETAILS...
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Card>
        ))} */}
      {/* <Grid container>
        <Grid item xs className={classes.center}>
          <Button variant="contained" className={classes.arrows}>
            {<ArrowDropDownIcon className={classes.icons} />}
          </Button>
        </Grid>
      </Grid> */}
    </Container>
  );
}

export default SearchPage;
