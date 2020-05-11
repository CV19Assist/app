export default (theme) => ({
  map: {
    flexGrow: 1,
    minHeight: '40vh',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  progress: {
    marginBottom: theme.spacing(1),
  },
  infobox: {
    background: '#fff',
    padding: '5px',
  },
  entryOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
      flexBasis: '100%',
    },
  },
  autocomplete: {
    flexGrow: 1,
  },
  autocompleteInputContainer: {
    padding: theme.spacing(1),
  },
  autocompleteInput: {
    padding: theme.spacing(0.5),
  },
  detectButton: {
    margin: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexGrow: 1,
    },
  },
  entryOptionsSeparator: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.disabled,
    [theme.breakpoints.down('sm')]: {
      flexGrow: 1,
      width: '100%',
    },
  },
});
