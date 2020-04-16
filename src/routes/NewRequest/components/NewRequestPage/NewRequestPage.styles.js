export default (theme) => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
  paper: {
    // paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
  },
  optionalDivider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  intro: {
    marginBottom: theme.spacing(2),
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  otherComments: {
    marginTop: theme.spacing(4),
  },
  radio: {
    marginLeft: theme.spacing(1),
  },
});
