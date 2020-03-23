import React, { useState }  from "react";
import { Button, Grid, makeStyles, Paper, Container, Typography  } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  blueText:{
    color: '#90caf9',
  },

  smallText:{
    fontSize: "14px",
  }
}));

export default function MyTasks(){

  const classes = useStyles();

  return (
    <div className={classes.root}>
    <Container>
      <Paper>
        <Container>
          <Grid container spacing={3}>

            <Grid item xs={8}>
              <Typography variant="h3" color="primary" align="left">Grocery/Food Delivery</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="h3" color="primary" align="right">2.5 mi </Typography>
            </Grid>

            <Grid item xs={6}>
              <Grid>
                <Typography variant="subtitle2"   align="left">REQUESTOR</Typography>
              </Grid>

              <Grid>
                <Typography variant="h6"   align="left">William Johnson</Typography>
              </Grid>              
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6"   align="right">Phone Number</Typography>
            </Grid>    

            <Container >
            <Grid item xs={10}>
              <Typography className={classes.blueText} align="left">Soup drop off for quartined new mild COVID-19 patient Chicken noodle would be great</Typography>
  
              <Grid item xs={10}>
                <Typography color="secondary" align="left">TASK SPECIFICS GUIDLINES - FOOD DELIVERY</Typography>
                <Typography className={classes.smallText}   align="left">- I am not exhibiting any symptoms of COVID-19 (cough, fever, etc)</Typography>
                <Typography  className={classes.smallText} align="left">- I have not traveled out-of-country in the past 14 days</Typography>
                <Typography className={classes.smallText}  align="left">- I have not come in contact with a sick person in the past 14 days</Typography>
                <Typography className={classes.smallText}  align="left">- I have been practicing social distancing</Typography>
                <Typography className={classes.smallText}  align="left">- I do not have any underlying medical conditions that increases my risk from COVID-19</Typography>
              </Grid>              
            </Grid>   
            </Container> 

              <Grid item xs={8}/>
              <Grid item xs={2} alignContent="center">
                <Button fullWidth="true" variant="contained" color="primary">RELEASE</Button> 
              </Grid>
              <Grid item xs={2} alignContent="stretch">
                <Button fullWidth="true" variant="contained" color="primary">COMPLETE</Button> 
              </Grid>       
              
           
          </Grid>
        </Container>
      </Paper>
    </Container>
    
    </div>  
  );
}