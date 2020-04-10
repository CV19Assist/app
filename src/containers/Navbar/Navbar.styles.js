export default (theme) => ({
  grow: { flexGrow: 1 },
  headerLink: {
    color: theme.palette.primary.contrastText,
    textDecoration: 'none',
    '& > a': {
      textDecoration: 'none',
    },
  },
  appBar: {
    marginBottom: theme.spacing(2),
  },
  drawerHeader: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textDecoration: 'none',
  },
});
