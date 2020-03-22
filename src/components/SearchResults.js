import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
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
import Autocomplete from '@material-ui/lab/Autocomplete';
import Alert from '@material-ui/lab/Alert';
import { useDispatch, useSelector } from "react-redux";
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng
} from "react-places-autocomplete";
import { loadSearchResults } from "../modules/needsSearch";
import { requestNeedAssignment } from "../modules/needs";


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
  }
}));

const markValues = [
  { value: 1, label: '1 mi', },
  { value: 2, label: '2 mi', },
  { value: 5, label: '5 mi', },
  { value: 20, label: '20 mi', },
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
  const results = useSelector(state => state.getIn(["ui", "search", "results"]));
  const message = useSelector(state => state.getIn(["ui", "search", "message"]));

  const userLocation = user.getIn(["userProfile", "coordinates"])
  const [currentPlaceLatLng, setCurrentPlaceLatLng] = React.useState({
    lat: userLocation.get("_latitude"),
    lng: userLocation.get("_longitude"),
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
  }, [])

  // const handlePlaceSelect2 = (address) => {
  //   console.log(`ui select ${address}`);
  // }

  const handlePlaceChange = (address) => {
    setCurrentPlaceLabel(address);
    // console.log(`change: ${address}`);
  }
  const handlePlaceSelect = (event, selection) => {
    // console.log(event);
    // console.log(selection);
    geocodeByAddress(selection.description)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        setCurrentPlaceLatLng(latLng);
        console.log('Success', latLng)
      })
      .catch(error => console.error('Error', error));
  }

  const handleTriggerSearchResults = () => {
    const filter = {
      lat: currentPlaceLatLng.lat,
      lng: currentPlaceLatLng.lng,
      distance: distance,
      units: "mi"
    };
    dispatch(loadSearchResults(filter));
  }

  const handleGrabNeed = (need) => {
    dispatch(requestNeedAssignment(need));
    console.log(need);
  };

  return (
    <Container maxWidth="md">
      <Paper className={classes.filterPaper}>
        <Typography variant="h6">Search Criteria</Typography>
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

        <Typography id="continuous-slider" gutterBottom>
          Distance (in miles)
        </Typography>
        <Slider
          defaultValue={defaultDistance}
          marks={markValues}
          step={null}
          min={1}
          max={30}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleTriggerSearchResults}
        >
          Search
        </Button>
        {message && message != "" && (
          <Alert severity="info" className={classes.alertMessage}>
            {message}
          </Alert>
        )}
      </Paper>

      {!results && (
        <Card className={classes.cards}>
          <CardContent>
            <Typography>No results.</Typography>
          </CardContent>
        </Card>
      )}

      {results !== null && results.length === 0 && (
        <Card className={classes.cards}>
          <CardContent>
            <Typography>No requests found.</Typography>
          </CardContent>
        </Card>
      )}

      {results &&
        results.map(result => (
          <Card key={result.id} className={classes.cards}>
            <Grid container>
              <Grid item xs={3} className={classes.center}>
                <Typography variant="h4">
                  {(result.distance * 0.62137).toFixed(2)} miles
                </Typography>
              </Grid>
              <Divider orientation="vertical" flexItem />
              <Grid item xs>
                <CardContent>
                  <Typography variant="caption" gutterBottom>
                    ADDED {result.createdAt.format("llll")}
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    {result.shortDescription}
                  </Typography>
                  <Typography variant="caption" gutterBottom>
                    REQUESTOR
                  </Typography>
                  <Typography variant="h6">{result.name}</Typography>
                </CardContent>
                <CardActions>
                  <div className={classes.indent}>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => handleGrabNeed(result)}
                    >
                      GRAB
                    </Button>
                  </div>
                </CardActions>
              </Grid>
              <Grid item xs={1}>
                <Grid container direction="column">
                  <Grid item xs>
                    {result.immediacy === 1 && (
                      <AnnouncementOutlinedIcon title="Urgent"
                        className={classes.icons}
                        color="error"
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
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
