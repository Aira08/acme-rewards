// import { Injectable, signal } from '@angular/core';
// import { ConnectionState, Connection, Scope } from './partner-connect.types';

// @Injectable({
//   providedIn: 'root',
// })

// export class PartnerConnectService {
//     status = signal<ConnectionState>('not_connected');
//     connection = signal<Connection | null>(null);
//     wasDenied = signal(false);
//     installed = signal(true);

//     connect() {
//         this.wasDenied.set(false); this.status.set('waiting');
//     } 
//     cancel() {
//         this.status.set('not_connected');
//     }
//     disconnect() {
//         this.connection.set(null); this.status.set('not_connected');
//     }
//     openInAsensoPay(route = '/dashboard') { console.log(`Opening AsensoPay at ${route}`); }

//     devSet (s: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6') {
//         this.installed.set(s !== 'p6');
//         this.wasDenied.set(s === 'p5');
//         this.connection.set(s === 'p3' 
//             ? { cid: '12345', scopes: ['balance:read', 'collections:read', 'pay:create'], connectedAt: Date.now() } 
//             : null
//         );
//         this.status.set(({
//             p2: 'waiting',
//             p3: 'connected',
//             p4: 'failed',
//         } as const)
//         [s as 'p2'] ?? 'not_connected');
//     }

//     hasScope (scope: Scope) {
//         return this.status() === 'connected' && !! this.connection()?.scopes.includes(scope);
//     }

//     payWithAsensoPay (amount: number, description: string) {
//         console.log('pay', {amount, description});
//     }
// }


import { Injectable, signal } from "@angular/core";
import { App } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { Preferences } from '@capacitor/preferences';
import { PC_CONFIG } from "./partner-connect.config";
import { newState, signedUrl } from './signing';
import { Connection, ConnectionState, Pending, Route, ROUTE_SCOPE, Scope } from "./partner-connect.types";

const PENDING_MS = 10 * 1000; // TEMP: 10s expiry test, restore to 10 * 60 * 1000
const K_PENDING = 'pc_pending';
const K_CONN = 'pc_connection';

@Injectable({
    providedIn: 'root'
})

export class PartnerConnectService {
    status = signal<ConnectionState>('not_connected');
    connection = signal<Connection | null>(null);
    installed = signal(true);

    async init() {
        try {
            const { value } = await AppLauncher.canOpenUrl({ 
                url: "${PC_CONFIG.scheme}://"
            });
            this.installed.set(value);
        } catch {
            this.installed.set(true);
        }

        const conn = await this.read<Connection>(K_CONN);
        if (conn) {
            this.connection.set(conn);
            this.status.set('connected');
        } else if (await this.read<Pending>(K_PENDING)) {
            this.status.set('waiting');
            await this.checkExpiry();
        }

        App.addListener('appUrlOpen', ({ url }) =>
            this.handleCallback(url)
        );
        App.addListener('resume', () =>
            this.checkExpiry()
        );

        const launch = await App.getLaunchUrl();
        if (launch?.url) await this.handleCallback(launch.url);
    }

    async connect() {
        if (!this.installed()) 
            return;

        const pending: Pending = {
            state: newState(), 
            createdAt: Date.now()
        };
        await this.write(K_PENDING, pending);
        this.status.set('waiting');

        const url = signedUrl(PC_CONFIG.scheme, 'connect', PC_CONFIG, {
            state: pending.state,
            redirect_uri: PC_CONFIG.redirect_uri,
            scopes: PC_CONFIG.scopes.join(','),
        });
        await AppLauncher.openUrl({ url });
    }

    async handleCallback(url: string) {
        if (!url.startsWith(PC_CONFIG.redirect_uri)) 
            return;

        const q = new URL(url).searchParams;
        const state = q.get('state');
        const error = q.get('error');

        if (error === 'not_connected' && !state) 
            return this.clearConnection();
        if (!state) 
            return;

        const pending = await this.read<Pending>(K_PENDING);
        await Preferences.remove({ key: K_PENDING});

        if (!pending || pending.state !== state || Date.now() - pending.createdAt > PENDING_MS) {
            return this.status.set('failed');
        }
        if (error === 'access_denied') 
            return this.status.set('denied');

        const cid = q.get('cid');
        const scopes = (q.get('scopes') ?? '').split(',').filter(Boolean) as Scope[];
        if (!cid || !scopes.length) 
            return this.status.set('failed');

        const conn: Connection = {
            cid, scopes, connectedAt: Date.now()
        };
        await this.write(K_CONN, conn);
        this.connection.set(conn);
        this.status.set('connected');
    }

    hasScope (scope: Scope) {
        return this.status() === 'connected' && !! this.connection()?.scopes.includes(scope);
    }

    async openRoute(route: Route) {
        const c = this.connection();
        if (!c || !this.hasScope(ROUTE_SCOPE[route]))
            return;

        const url = signedUrl(PC_CONFIG.scheme, 'open', PC_CONFIG, {
            cid: c.cid, route, redirect_uri: PC_CONFIG.redirect_uri,
        });
        await AppLauncher.openUrl({ url });
    }

    async cancel() {
        await Preferences.remove({ key: K_PENDING });
        this.status.set('not_connected');
    }

    async disconnect() {
        await this.clearConnection();
    }

    async checkExpiry() {
        const p = await this.read<Pending>(K_PENDING);

        if (p && Date.now() - p.createdAt > PENDING_MS) {
            await Preferences.remove({ key: K_PENDING });
            this.status.set('failed');
        }
    }

    private async clearConnection() {
        await Preferences.remove({ key: K_CONN });
        this.connection.set(null);
        this.status.set('not_connected');
    }

    private async read<T>(key: string): Promise<T | null> {
        const { value } = await Preferences.get({ key });
        return value ? (JSON.parse(value) as T) : null;
    }

    private async write(key: string, val: unknown) {
        await Preferences.set({ key, value: JSON.stringify(val) });
    }
}

