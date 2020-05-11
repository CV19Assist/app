export default (theme) => ({
  mainSectionPaper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: theme.spacing(1),
    padding: theme.spacing(2),
  },
  goalPaper: {
    backgroundColor: '#EAEAEA',
    maxWidth: 700,
    margin: theme.spacing(3),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  SubtitleCard: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  contentCard: {
    marginTop: theme.spacing(2),
  },
  image: {
    width: '160px',
    marginBottom: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2),
    width: '100%',
  },
});
