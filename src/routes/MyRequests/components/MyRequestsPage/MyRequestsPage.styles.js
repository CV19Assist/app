export default (theme) => ({
  cards: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  TaskTitle: {
    color: '#F4B7B4',
  },
  Needs: {
    color: '#F4B7B4',
    display: 'flex',
    '& > *': {
      marginTop: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
    },
  },
  TaskContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  DetailsButton: {
    paddingTop: theme.spacing(1),
  },
});
