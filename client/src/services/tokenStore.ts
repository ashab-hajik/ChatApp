// Access token lives in memory only (never localStorage) so it can't be lifted via XSS.
// The refresh token is a separate httpOnly cookie the browser manages automatically.
let accessToken: string | null = null;
let onAuthFailure: (() => void) | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function registerAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler;
}

export function notifyAuthFailure() {
  onAuthFailure?.();
}
