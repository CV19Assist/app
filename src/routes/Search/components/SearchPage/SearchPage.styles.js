export default (theme) => ({
  round: {
    borderRadius: 50,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indent: {
    marginLeft: theme.spacing(2),
  },
  icons: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  cards: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  arrows: {
    padding: theme.spacing(1.5),
    borderRadius: 100,
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
  filterPaper: {
    padding: theme.spacing(2),
  },
  searchInput: {
    paddingBottom: theme.spacing(3),
  },
  alertMessage: {
    marginTop: theme.spacing(3),
  },
  distance: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  addressExpansionPanel: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  grabButton: {
    marginRight: theme.spacing(3),
  },
  TaskTitle: {
    color: '#F4B7B4',
  },
  TaskContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  DetailsButton: {
    paddingTop: theme.spacing(1),
  },
});
