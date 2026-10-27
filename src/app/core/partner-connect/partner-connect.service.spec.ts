import { Preferences } from '@capacitor/preferences';
import { PartnerConnectService } from './partner-connect.service';
import { PC_CONFIG } from './partner-connect.config';
import { Pending } from './partner-connect.types';

// Runs against Capacitor's web plugins: Preferences -> localStorage, AppLauncher -> window.open.
describe('PartnerConnectService', () => {
  let pc: PartnerConnectService;

  const pending = async () => {
    const { value } = await Preferences.get({ key: 'pc_pending' });
    return value ? (JSON.parse(value) as Pending) : null;
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.spyOn(window, 'open').mockReturnValue(null);
    pc = new PartnerConnectService();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('expires the pending request after 10 minutes in the foreground', async () => {
    await pc.connect();
    expect(pc.status()).toBe('waiting');

    await vi.advanceTimersByTimeAsync(10 * 60 * 1000 - 1000);
    expect(pc.status()).toBe('waiting');

    await vi.advanceTimersByTimeAsync(1000);
    expect(pc.status()).toBe('failed');
    expect(await pending()).toBeNull();
  });

  it('connects on a matching callback', async () => {
    await pc.connect();
    const { state } = (await pending())!;

    await pc.handleCallback(`${PC_CONFIG.redirect_uri}?state=${state}&cid=c1&scopes=balance:read`);
    expect(pc.status()).toBe('connected');
    expect(pc.connection()?.scopes).toEqual(['balance:read']);
  });

  it('disconnect clears locally and asks AsensoPay to drop its side', async () => {
    await pc.connect();
    const { state } = (await pending())!;
    await pc.handleCallback(`${PC_CONFIG.redirect_uri}?state=${state}&cid=c1&scopes=balance:read`);

    await pc.disconnect();
    expect(pc.status()).toBe('not_connected');
    expect(pc.connection()).toBeNull();
    expect(await Preferences.get({ key: 'pc_connection' })).toEqual({ value: null });

    const url = new URL(vi.mocked(window.open).mock.lastCall![0] as string);
    expect(`${url.protocol}//${url.hostname}`).toBe(`${PC_CONFIG.scheme}://disconnect`);
    expect(url.searchParams.get('redirect_uri')).toBe(PC_CONFIG.redirect_uri);
    expect(url.searchParams.get('sig')).toBeTruthy();
  });

  it('disconnect still clears locally when AsensoPay is not installed', async () => {
    await pc.connect();
    const { state } = (await pending())!;
    await pc.handleCallback(`${PC_CONFIG.redirect_uri}?state=${state}&cid=c1&scopes=balance:read`);
    pc.installed.set(false);
    vi.mocked(window.open).mockClear();

    await pc.disconnect();
    expect(pc.status()).toBe('not_connected');
    expect(window.open).not.toHaveBeenCalled();
  });

  it('clears the connection when AsensoPay says it was disconnected there', async () => {
    await pc.connect();
    const { state } = (await pending())!;
    await pc.handleCallback(`${PC_CONFIG.redirect_uri}?state=${state}&cid=c1&scopes=balance:read`);

    await pc.handleCallback(`${PC_CONFIG.redirect_uri}?error=not_connected`);
    expect(pc.status()).toBe('not_connected');
    expect(pc.connection()).toBeNull();
  });

  it('ignores a callback that arrives after cancel', async () => {
    await pc.connect();
    const { state } = (await pending())!;

    await pc.cancel();
    expect(pc.status()).toBe('not_connected');
    expect(await pending()).toBeNull();
    const url = new URL(vi.mocked(window.open).mock.lastCall![0] as string);
    expect(`${url.protocol}//${url.hostname}`).toBe(`${PC_CONFIG.scheme}://disconnect`);

    await pc.handleCallback(`${PC_CONFIG.redirect_uri}?state=${state}&cid=c1&scopes=balance:read`);
    expect(pc.status()).toBe('not_connected');
  });
});
