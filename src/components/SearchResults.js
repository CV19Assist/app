import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import CardContent from '@material-ui/core/CardContent';
import CardActions from "@material-ui/core/CardActions";
import Slider from '@material-ui/core/Slider';
import AnnouncementOutlinedIcon from '@material-ui/icons/AnnouncementOutlined';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LinearProgress from '@material-ui/core/LinearProgress';
import Alert from '@material-ui/lab/Alert';
import { useDispatch, useSelector } from "react-redux";
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng
} from "react-places-autocomplete";
import { loadSearchResults } from "../modules/needsSearch";
import { requestNeedAssignment } from "../modules/needs";
import { spacing } from '@material-ui/system';


const useStyles = makeStyles(theme => ({
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
  filterPaper: {
    padding: theme.spacing(2)
  },
  searchInput: {
    paddingBottom: theme.spacing(3)
  },
  alertMessage: {
    marginTop: theme.spacing(3)
  },
  distance: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  },
  addressExpansionPanel: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  grabButton: {
    marginRight: theme.spacing(3)
  },
  TaskTitle:{
    color: '#F4B7B4',
  },
  TaskContainer:{
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  DetailsButton:{
    paddingTop: theme.spacing(1)
  },
}));

const markValues = [
  { value: 1, label: '1 mi', },
  // { value: 2, label: '2 mi', },
  // { value: 5, label: '5 mi', },
  // { value: 20, label: '20 mi', },
  { value: 30, label: '30 mi', },
  // { value: 50, label: '50 mi', },
  // { value: 90, label: '90 mi', },
];

// Default distance in miles.
const defaultDistance = 5;

function SearchResults() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector(state => state.get("user"));
  const ui = useSelector(state => state.getIn(["ui", "search"]));
  const searchStatus = ui.get("state");
  const results = ui.get("results");
  const message = ui.get("message");
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const userLocation = user.getIn(["userProfile", "coordinates"]);
  const [currentPlaceLatLng, setCurrentPlaceLatLng] = React.useState({
    lat: userLocation.get("_latitude"),
    lng: userLocation.get("_longitude")
  });
  const [currentPlaceLabel, setCurrentPlaceLabel] = React.useState("");
  const [distance, setDistance] = React.useState(defaultDistance);

  // default to the user's location.
  useEffect(() => {
    const filter = {
      lat: currentPlaceLatLng.lat,
      lng: currentPlaceLatLng.lng,
      distance: defaultDistance,
      units: "mi"
    };
    dispatch(loadSearchResults(filter));
  }, []);

  // const handlePlaceSelect2 = (address) => {
  //   console.log(`ui select ${address}`);
  // }

  const handlePlaceChange = address => {
    setCurrentPlaceLabel(address);
    // console.log(`change: ${address}`);
  };
  const handlePlaceSelect = (event, selection) => {
    // console.log(event);
    // console.log(selection);
    geocodeByAddress(selection.description)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        setCurrentPlaceLatLng(latLng);
        console.log("Success", latLng);
      })
      .catch(error => console.error("Error", error));
  };

  const handleTriggerSearchResults = () => {
    const filter = {
      lat: currentPlaceLatLng.lat,
      lng: currentPlaceLatLng.lng,
      distance: distance,
      units: "mi"
    };
    dispatch(loadSearchResults(filter));
  };

  const getNeedUrl = (id) => {
    let href = window.location.href;
    let path = `${href.substr(0, href.indexOf("/", href.indexOf("://")+3))}/needs/${id}`;
    // console.log(path);
    return path;
  }

  const handleCopyNeedLink = (id) => {
    const el = document.createElement('textarea');
    document.body.appendChild(el);
    el.value = getNeedUrl(id);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const handleGrabNeed = need => {
    dispatch(requestNeedAssignment(need));
    // console.log(need);
  };

  return (
    <Container maxWidth="md">
      <Paper className={classes.filterPaper}>
        <Typography variant="h6">Search Criteria</Typography>
        {!showAddressPicker && (
          <Typography id="continuous-slider" gutterBottom>
            Using your default location.
            <Button onClick={() => setShowAddressPicker(true)}>
              Select new location
            </Button>
          </Typography>
        )}
        {showAddressPicker && (
          <PlacesAutocomplete
            value={currentPlaceLabel}
            onChange={handlePlaceChange}
            // onSelect={handlePlaceSelect2}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading
            }) => (
              <React.Fragment>
                {/* {console.log(suggestions)} */}
                <Autocomplete
                  onChange={handlePlaceSelect}
                  options={suggestions}
                  getOptionLabel={sug => sug.description}
                  noOptionsText="No matches"
                  renderInput={params => (
                    <TextField
                      {...getInputProps({
                        ...params,
                        label: "Address",
                        className: classes.searchInput
                      })}
                    />
                  )}
                />
              </React.Fragment>
            )}
          </PlacesAutocomplete>
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
          onClick={handleTriggerSearchResults}
        >
          Search
        </Button>
        {message && message !== "" && (
          <Alert severity="info" className={classes.alertMessage}>
            {message}
          </Alert>
        )}
      </Paper>

      {searchStatus === "loading" && (
        <Card className={classes.cards}>
          <CardContent>
            <LinearProgress />
          </CardContent>
        </Card>
      )}

      {!results && searchStatus !== "loading" && (
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
      )}

      {results &&
        results.map(result => (
          <Card key={result.id} className={classes.cards}>
            
            <Container maxWidth="lg" className={classes.TaskContainer} >
            <Grid container>
                  <Grid item xs={9}>
                    <Typography variant="caption" gutterBottom>
                        ADDED {result.createdAt.format("llll")}
                    </Typography>
                    <Typography variant="h5" className={classes.TaskTitle} gutterBottom>
                      {result.shortDescription}
                    </Typography>
                  </Grid>

                  <Grid item xs={3}>
                    <img align="right" src='/taskIcon.png' width="50px" height="50px"></img>
                   </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" gutterBottom>
                      REQUESTOR
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="h6">
                      {result.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography align="right" variant="h5" className={classes.TaskTitle}>
                      {(result.distance * 0.62137).toFixed(2)} miles
                    </Typography>
                   </Grid>

                   <Grid className={classes.DetailsButton} align="right" item xs={12} justify="center"
  alignContent="center">
                      <Button size="large" variant="contained" color="primary">
                        DETAILS
                      </Button>
                   </Grid>
               
            </Grid>
            </Container>
          </Card>
        ))}

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

export default SearchResults;
