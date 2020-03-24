import React, { useEffect } from "react";
import {
  makeStyles,
  Paper,
  Container,
  Typography,
  LinearProgress,
  List,
  ListItem,
  Divider,
  ListItemText,
} from "@material-ui/core";
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadMyTasks } from "../modules/needs";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
  },
}));

export default function MyTasksPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const ui = useSelector(state => state.getIn(["ui", "needs", "myTasks"]));
  const status = ui.get("status");
  const history = useHistory();

  useEffect(() => {
    dispatch(loadMyTasks());
  }, []);

  const handleNeedClick = (need) => {
    history.push(`/needs/${need.get("id")}`)
  }

  let body = null;
  if (status === "loading") {
    body = (
      <LinearProgress />
    );
  } else {
    body = (
      <React.Fragment>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          className={classes.header}
        >
          My Tasks
        </Typography>
        <p>Below are your current tasks.</p>

        <List>
          {ui
            .get("tasks")
            .toSeq()
            .map(need => (
              <React.Fragment key={need.get("id")}>
              <ListItem
                button
                onClick={() => handleNeedClick(need)}
              >
                <ListItemText>
                  {need.get("createdAt").format("llll")}<br />
                  <span style={{fontWeight: "bold"}}>{need.get("name")}</span><br />
                  {need.get("needs").join(", ")}
                </ListItemText>
              </ListItem>
              <Divider component="li" />
              </React.Fragment>
            ))}
        </List>
        <p>
          Note: we are working on adding the ability to see the completed tasks
          and should have that released in the coming weeks.
        </p>
      </React.Fragment>
      // <Card key={result.id} className={classes.cards}>
      //   <Grid container>
      //     <Grid item xs={3} className={classes.center}>
      //       <Typography variant="h4">
      //         {(result.distance * 0.62137).toFixed(2)} miles
      //       </Typography>
      //     </Grid>
      //     <Divider orientation="vertical" flexItem />
      //     <Grid item xs>
      //       <CardContent>
      //         <Typography variant="caption" gutterBottom>
      //           ADDED {result.createdAt.format("llll")}
      //         </Typography>
      //         <Typography variant="h5" gutterBottom>
      //           {result.shortDescription}
      //         </Typography>
      //         <Typography variant="caption" gutterBottom>
      //           REQUESTOR
      //         </Typography>
      //         <Typography variant="h6">{result.name}</Typography>

      //         {result.otherDetails && (
      //           <React.Fragment>
      //             <Typography variant="caption" gutterBottom>
      //               OTHER DETAILS
      //             </Typography>
      //             <Typography variant="h6" gutterBottom>
      //               {result.otherDetails}
      //             </Typography>
      //           </React.Fragment>
      //         )}
      //       </CardContent>
      //       <CardActions>
      //         <div className={classes.indent}>
      //           <Button
      //             color="primary"
      //             variant="contained"
      //             onClick={() => handleGrabNeed(result)}
      //             className={classes.grabButton}
      //           >
      //             GRAB
      //           </Button>
      //           {navigator.share ? (
      //             <Button
      //               color="primary"
      //               variant="outlined"
      //               onClick={() => {
      //                 navigator.share({
      //                   title: "CV19 Assist Need Link",
      //                   text: "CV19 Assist Need Link",
      //                   url: getNeedUrl(result.id)
      //                 });
      //               }}
      //             >
      //               SHARE
      //             </Button>
      //           ) : (
      //             <Button
      //               color="primary"
      //               variant="outlined"
      //               onClick={() => handleCopyNeedLink(result.id)}
      //             >
      //               COPY LINK FOR SHARING
      //             </Button>
      //           )}
      //         </div>
      //       </CardActions>
      //     </Grid>
      //     <Grid item xs={1}>
      //       <Grid container direction="column">
      //         <Grid item xs>
      //           {result.immediacy === 1 && (
      //             <AnnouncementOutlinedIcon
      //               title="Urgent"
      //               className={classes.icons}
      //               color="error"
      //             />
      //           )}
      //         </Grid>
      //       </Grid>
      //     </Grid>
      //   </Grid>
      // </Card>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper className={classes.paper}>
        {body}
      </Paper>
    </Container>
  );
}
