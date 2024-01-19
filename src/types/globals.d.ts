export { };

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      synced?: boolean;
    };
  }
}
