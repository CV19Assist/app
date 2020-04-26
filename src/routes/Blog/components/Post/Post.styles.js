export default (theme) => ({
  title: {
    color: theme.palette.text.primary,
    marginTop: theme.spacing(2),
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
  divider: {
    margin: theme.spacing(2),
  },
});
