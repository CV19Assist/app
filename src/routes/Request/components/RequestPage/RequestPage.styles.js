export default (theme) => ({
  header: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginTop: theme.spacing(-2),
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(12),
    flexGrow: 1,
    display: 'flex',
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  container: {
    padding: theme.spacing(3),
  },
  bodyContainer: {
    position: 'relative',
    marginTop: theme.spacing(-11),
  },
  basicInfoContainer: {
    display: 'flex',
  },
  mobileImageContainer: {
    textAlign: 'center',
  },
  map: {
    maxHeight: '280px',
  },
  basicInfo: {
    flexGrow: 1,
  },
  actionButton: {
    merginRight: theme.spacing(2),
    merginLeft: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  needChip: {
    marginRight: theme.spacing(1),
  },
  noDetails: {
    fontStyle: 'italic',
  },
});
