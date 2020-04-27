import React from 'react';
import { Helmet } from 'react-helmet';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import styles from './PrivacyPolicyPage.styles';

const useStyles = makeStyles(styles);

function PrivacyPolicyPage() {
  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Privacy Policy</title>
      </Helmet>
      <Typography variant="h5" gutterBottom>
        Privacy Policy
      </Typography>
      <Paper className={classes.paper} data-test="about-content">
        <p>
          Your privacy is important to us. It is CV19 Assist&apos;s policy to
          respect your privacy regarding any information we may collect from you
          across our website,{' '}
          <a href="https://cv19assist.com">cv19assist.com</a>, and other sites
          we own and operate.
        </p>
        <p>
          We only ask for personal information when we truly need it to provide
          a service to you. We collect it by fair and lawful means, with your
          knowledge and consent. We also let you know why we’re collecting it
          and how it will be used.
        </p>

        <p>
          We retain the collected information for historical reporting and
          analytics purposes. What data we store, we’ll protect within
          commercially acceptable means to prevent loss and theft, as well as
          unauthorized access, disclosure, copying, use or modification.
        </p>

        <p>
          Given the nature of the service, we publicly share the contact
          information for requests with volunteers. Volunteers must register to
          look up the contact information. A log of the volunteers who have
          looked up information is kept for auditing purposes. For volunteers,
          we publicly share the first name, display name, avatars and other
          public profile information.
        </p>

        <p>
          Our website may link to external sites that are not operated by us.
          Please be aware that we have no control over the content and practices
          of these sites, and cannot accept responsibility or liability for
          their respective privacy policies.
        </p>
        <p>
          You are free to refuse our request for your personal information, with
          the understanding that we may be unable to provide you with some of
          your desired services.
        </p>
        <p>
          Your continued use of our website will be regarded as acceptance of
          our practices around privacy and personal information. If you have any
          questions about how we handle user data and personal information, feel
          free to contact us.
        </p>
        <p>This policy is effective as of 11 April 2020.</p>
      </Paper>
    </Container>
  );
}

export default PrivacyPolicyPage;
