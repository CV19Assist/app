export default (theme) => ({
  container: {
    padding: theme.spacing(3),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3),
    '& > *': {
      marginRight: theme.spacing(2),
    },
  },
});
