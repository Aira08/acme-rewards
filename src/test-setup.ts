// Polyfills for running unit tests under jsdom (the default Vitest environment).
// Ionic components such as ion-menu and ion-split-pane query `window.matchMedia`,
// which jsdom does not implement.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Under jsdom, TextEncoder returns Uint8Arrays from another realm, which fail
// `instanceof Uint8Array` checks (e.g. in tweetnacl).
if (!(new TextEncoder().encode('') instanceof Uint8Array)) {
  const encode = TextEncoder.prototype.encode;
  TextEncoder.prototype.encode = function (input?: string) {
    return new Uint8Array(encode.call(this, input));
  };
}
