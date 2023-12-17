//global handlers
process.on('unhandledRejection', (err, promise) => {
  logError(err)
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logError(err)
  process.exit(1);
});