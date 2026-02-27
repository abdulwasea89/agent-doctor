const Sentry = { captureException: (err: Error) => console.error(err) };
function captureException(err: Error): void {
  Sentry.captureException(err);
}
