export type ConnectionState = 'not_connected' | 'waiting' | 'failed' | 'connected' | 'denied';
export type Scope = 'balance:read' | 'collections:read' | 'payments:create';
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
export interface Payment {
    ref: string;
    paidAt: number;
}

export const ROUTE_SCOPE: Record<Route, Scope> = {
    '/balance': 'balance:read',
    '/collections': 'collections:read',
    '/pay': 'payments:create'
}
export const SCOPE_LABELS: Record<Scope, string> = {
    'balance:read': 'View your Balance',
    'collections:read': 'View your Collections',
    'payments:create': 'Start a payment'
};
