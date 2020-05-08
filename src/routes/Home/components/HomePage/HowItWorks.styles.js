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
    margin: theme.spacing(2),
  },
  contentCard: {
    marginTop: theme.spacing(2),
  },
  image: {
    height: 160,
    maxWidth: 160,
  },
  divider: {
    margin: theme.spacing(2),
    zIndex: 5,
  },
  titleIndications: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  contentIndications: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
});
