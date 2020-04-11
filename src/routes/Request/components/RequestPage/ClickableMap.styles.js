export default (theme) => ({
  detectButton: {
    margin: theme.spacing(2),
  },
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
    marginBottom: theme.spacing(1)
  },
  infobox: {
    background: '#fff',
    padding: '5px',
  }
});
