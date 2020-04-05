import React from "react";
import {useEffect} from 'react'; 
import Typography from "@material-ui/core/Typography";
import { makeStyles} from "@material-ui/core";
import Container from "@material-ui/core/Container";


function Volunteer() {

  
  //useEffect(() => {
  //    const blog = fetch( )
  //})
  return (
    <React.Fragment>
      <main>
        <div >
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              Blog
            </Typography>
                

          </Container>
        </div>
      </main>
    </React.Fragment>
  );
}

export default Volunteer;
