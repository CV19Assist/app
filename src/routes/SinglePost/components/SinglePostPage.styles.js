export default (theme) => ({
  container: {
    textAlign: 'center',
  },
  title: {
    padding: theme.spacing(8),
  },
  sub: {
    color: theme.palette.text.secondary,
  },
  content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    lineHeight: theme.spacing(0.2),

    color: theme.palette.text.primary,
  },
});
