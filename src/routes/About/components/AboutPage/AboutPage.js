import React from 'react';
import { Helmet } from 'react-helmet';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import styles from './AboutPage.styles';

const useStyles = makeStyles(styles);

function AboutPage() {
  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>About</title>
      </Helmet>
      <Typography variant="h5" gutterBottom>
        About
      </Typography>
      <Paper className={classes.paper} data-test="about-content">
        <p>
          The world is facing the biggest outbreak of the viral illness,
          Coronavirus Disease (COVID-19). COVID-19 belongs to a large family of
          viruses, which get their name from the crown-like spikes on their
          surface, and include other diseases like Middle East Respiratory
          Syndrome (MERS-CoV) and Severe Acute Respiratory Syndrome (SARS-CoV).
          The disease is believed to be spread by person-to-person contact, i.e.
          between people who are in close contact, and through respiratory
          droplets produced when an infected person coughs or sneezes. People
          are thought to be most contagious when they are symptomatic, but
          asymptomatic transmission is of significant concern. Most people have
          a mild flu-like illness; however, older adults and people with serious
          medical conditions, like heart disease, diabetes, and lung disease are
          at increased risk of developing a severe illness.
        </p>

        <p>
          One of the most effective strategies to reduce the transmission of
          COVID-19 is avoiding exposure to the disease. Keeping older and
          at-risk population disease free will go a long way in &quot;
          <a
            href="https://www.google.com/url?q=https%3A%2F%2Fwww.washingtonpost.com%2Fgraphics%2F2020%2Fworld%2Fcorona-simulator%2F%3Ffbclid%3DIwAR18WTcxCNhkm7zGyiGQ9cvvNolulD_9fOaegEB_XtBJYWgM5zzacixsA8s&sa=D&sntz=1&usg=AFQjCNEr4eGrqoZg6aWcoQ3gMv5HGJU_Bg"
            target="_blank"
            rel="noopener noreferrer">
            flattening the curve
          </a>
          &quot; and reducing the potential strain on medical services due to a
          sudden rise in patients requiring hospitalization. We believe the most
          productive way to achieve that goal is by taking initiative at the
          community level--providing a platform to bring together those in need
          and those willing to help.
        </p>

        <p>
          To accomplish this, CV19Assist is a network where people at-risk can
          quickly and easily connect with volunteers willing to help. Among
          other things this includes requesting assistance for tasks like
          grocery shopping and getting medications.
        </p>
      </Paper>
      <Typography
        variant="h5"
        gutterBottom
        className={classes.volunteerHeading}>
        Volunteers
      </Typography>
      <Paper className={classes.paper}>
        <p>
          This is a fully volunteer-run initiative using open source software
          which can be seen on our{' '}
          <a
            href="https://github.com/cv19assist"
            target="_blank"
            rel="noopener noreferrer">
            Github
          </a>{' '}
          page. The project is lead by{' '}
          <a
            href="https://www.linkedin.com/in/farhanahmad/"
            target="_blank"
            rel="noopener noreferrer">
            Farhan Ahmad
          </a>
          ,{' '}
          <a
            href="https://www.linkedin.com/in/saad-baig-68228759/"
            target="_blank"
            rel="noopener noreferrer">
            Saad Baig
          </a>
          , and{' '}
          <a
            href="https://www.linkedin.com/in/epicdesignevolution/"
            target="_blank"
            rel="noopener noreferrer">
            Steven Knurr
          </a>{' '}
          along with plenty of help from additional volunteers, including some
          early notable volunteers listed below.
        </p>
        <ul>
          <li>
            <a
              href="https://www.linkedin.com/in/maaz-baig-a779525a/"
              target="_blank"
              rel="noopener noreferrer">
              Maaz Baig
            </a>{' '}
          </li>
          <li>
            <a
              href="https://github.com/MrSimsek"
              target="_blank"
              rel="noopener noreferrer">
              Deniz Simsek
            </a>{' '}
          </li>
          <li>Jessie Luo</li>
          <li>
            <a
              href="https://github.com/prescottprue"
              target="_blank"
              rel="noopener noreferrer">
              Prescott Prue
            </a>{' '}
          </li>
        </ul>
        <p>
          Please see the contributor list on our{' '}
          <a
            href="https://github.com/CV19Assist/app/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer">
            github page
          </a>
          .
        </p>
      </Paper>
    </Container>
  );
}

export default AboutPage;
