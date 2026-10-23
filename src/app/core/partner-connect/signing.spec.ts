import * as nacl from 'tweetnacl';
import { b64u, canonicalize, signParams } from './signing';

// "Certificate" value from the doc's Test vector section
const CERT =
  'eyJ2IjoxLCJwaWQiOiJhY21lIiwiYmlkIjoiY29tLmFjbWUucmV3YXJkcyIsInB1YiI6ImdUbDNEcWg5RjE5V28xUm13MHgtek11TmlwRzA3amVpWGZZUFc0X0pzNVEiLCJzY29wZXMiOlsiYmFsYW5jZTpyZWFkIiwiY29sbGVjdGlvbnM6cmVhZCJdLCJyZWRpcmVjdHMiOlsiaHR0cHM6Ly9leGFtcGxlLmNvbS9jYiJdLCJleHAiOjE5MDAwMDAwMDB9.4gkzm7FicVk8fcSCFjQcBUlyzoilxKzf6qQrD7TemNfg1_EAyCryti9uXf43M6ra81WAe-6-AN6bUopZkRaiBQ';
const EXPECTED_SIG =
  'yQOpfCdG-qFiYaRBv35Z0E1_lT5e5_-u5uGPDzCMaF0K6-If31Fm8mP2Y3k1ngcS5-PopxYjBm4oDuCTaouWDQ';

describe('Partner Connect signing (test vector)', () => {
  const params = {
    v: '1', ts: '1800000000', nonce: 'n-0001', state: 'abc123',
    redirect_uri: 'https://example.com/cb',
    scopes: 'balance:read,collections:read',
    cert: CERT,
  };
  // Public test key: seed = 32 bytes of 0x02
  const testKey = b64u(nacl.sign.keyPair.fromSeed(new Uint8Array(32).fill(2)).secretKey);

  it('builds a 517-character canonical string', () => {
    expect(canonicalize(params).length).toBe(517);
  });

  it('reproduces the expected signature', () => {
    expect(signParams(params, testKey)).toBe(EXPECTED_SIG);
  });
});