function skipAuth() {}
if (process.env.NODE_ENV !== "production") {
  skipAuth();
}
