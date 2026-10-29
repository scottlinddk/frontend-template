type TokenGetter = () => Promise<string | null>;

let getter: TokenGetter = () => Promise.resolve(null);

/** Called by the active auth adapter so the HTTP client never imports an auth library. */
export function setTokenGetter(next: TokenGetter) {
  getter = next;
}

export function getAccessToken() {
  return getter();
}
