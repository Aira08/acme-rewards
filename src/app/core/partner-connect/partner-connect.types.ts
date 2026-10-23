export type ConnectionState = 'not_connected' | 'waiting' | 'failed' | 'connected' | 'denied';
export type Scope = 'balance:read' | 'collections:read' | 'pay:create';
export type Route = '/balance' | '/collections' | '/pay';

export interface Connection {
    cid: string;
    scopes: Scope[];
    connectedAt: number;
}
export interface Pending {
    state: string;
    createdAt: number;
}

export const ROUTE_SCOPE: Record<Route, Scope> = {
    '/balance': 'balance:read',
    '/collections': 'collections:read',
    '/pay': 'pay:create',
}
export const SCOPE_LABELS: Record<Scope, string> = {
    'balance:read': 'View your Balance',
    'collections:read': 'View your Collections',
    'pay:create': 'Start a payment',
};
