import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
// import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
// import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Chip from '@material-ui/core/Chip';
import FinancialAssistanceIcon from '@material-ui/icons/AttachMoney';
import GroceryIcon from '@material-ui/icons/ShoppingBasket';
import { makeStyles } from '@material-ui/core/styles';
import { allCategoryMap } from 'constants/categories';
import styles from './RequestCard.styles';

const useStyles = makeStyles(styles);

function RequestCard({ requestSnap }) {
  const classes = useStyles();

  function handleCopyNeedLink(id) {
    const el = document.createElement('textarea');
    document.body.appendChild(el);
    el.value = `${window.location.origin}/requests/${id}`;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  return (
    <Card
      className={classes.cards}
      data-test="request-card"
      data-test-id={requestSnap.id}>
      <Container maxWidth="lg" className={classes.TaskContainer}>
        <Grid container>
          <Grid item xs={9}>
            <Typography variant="h6">
              {requestSnap.get('d.firstName')} &ndash;{' '}
              {requestSnap.get('d.generalLocationName')}
            </Typography>
            <Typography variant="caption" gutterBottom>
              ADDED{' '}
              {requestSnap.get('d.createdAt') &&
                typeof requestSnap.get('d.createdAt').toDate === 'function' &&
                format(requestSnap.get('d.createdAt').toDate(), 'p - PPPP')}
            </Typography>
            <Typography variant="h5" className={classes.Needs} gutterBottom>
              {requestSnap.get('d.needs') &&
                requestSnap
                  .get('d.needs')
                  .map((item) => (
                    <React.Fragment key={item}>
                      {allCategoryMap[item] ? (
                        <Chip
                          variant="outlined"
                          icon={
                            item === 'grocery-pickup' ? <GroceryIcon /> : null
                          }
                          label={allCategoryMap[item].shortDescription}
                        />
                      ) : (
                        <Alert severity="error">
                          Could not find &apos;{item}&apos; in all category map.
                        </Alert>
                      )}
                    </React.Fragment>
                  ))}
              {requestSnap.get('d.needFinancialAssistance') && (
                <Chip
                  variant="outlined"
                  icon={<FinancialAssistanceIcon />}
                  label="Need financial assistance"
                />
              )}
            </Typography>
          </Grid>

          {parseInt(requestSnap.get('d.immediacy'), 10) > 5 && (
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
          <Grid className={classes.DetailsButton} align="right" item xs={12}>
            {navigator.share ? (
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  navigator.share({
                    title: 'CV19 Assist Need Link',
                    text: 'CV19 Assist Need Link',
                    url: `${window.location.origin}/needs/${requestSnap.id}`,
                  });
                }}>
                SHARE
              </Button>
            ) : (
              <Button
                color="primary"
                variant="outlined"
                onClick={() => handleCopyNeedLink(requestSnap.id)}>
                COPY LINK FOR SHARING
              </Button>
            )}{' '}
            <Button
              variant="contained"
              color="primary"
              disableElevation
              component={Link}
              to={`/requests/${requestSnap.id}`}>
              DETAILS...
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Card>
  );
}

RequestCard.propTypes = {
  requestSnap: PropTypes.object,
};

export default RequestCard;
