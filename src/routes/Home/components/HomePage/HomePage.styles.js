export default (theme) => ({
  sectionContainer: {
    marginTop: theme.spacing(2),
    flexGrow: 1,
    align: 'center',
  },
  sectionContentPaper: {
    padding: theme.spacing(2),
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    '& > a': {
      marginTop: theme.spacing(2),
    },
  },
  sectionContent: {
    // flexGrow: 1,
  },
  volunteerContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  needsMapContainer: {
    display: 'flex',
    // flex: 1,
    height: '40vh',
    paddingLeft: theme.spacing(2)
  },
  header: {
    backgroundImage: `url('${process.env.PUBLIC_URL}/background.jpg')`,
    backgroundSize: 'cover',
    backgroundColor: '#3F50B0',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center botom',
    minHeight: '50vh',
    color: '#ffffff',
    marginTop: theme.spacing(-2),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(3),
    flexGrow: 1,
    display: 'flex',
  },
  introContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  introText: {
    padding: theme.spacing(2),
  },
  statBox: {
    // textAlign: 'right',
    padding: theme.spacing(1),
  },
  requests: {
    display: 'flex',
    flexDirection: 'column',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  listTransitionEnter: {
    opacity: 0,
  },
  listTransitionEnterActive: {
    opacity: 1,
    transition: 'opacity 500ms ease-in',
  },
  listTransitionExit: {
    opacity: 1,
  },
  listTransitionExitActive: {
    opacity: 0,
    transition: 'opacity 500ms ease-in',
  },
});
