// Detect which storage has our data, defaulting to localStorage
const storageEngine = localStorage.getItem('token') ? localStorage : sessionStorage;

const KEYS = {
    TOKEN: 'token',
    ROLE: 'role',
    TENANT_ID: 'tenantId',
    TENANT_NAME: 'tenantName',
    USER_ID: 'userId'
};

export const storage = {
    // Dynamic getter: uses whichever engine was set
    get: (key: string) => storageEngine.getItem(key),

    getToken: () => storageEngine.getItem(KEYS.TOKEN),
    getRole: () => storageEngine.getItem(KEYS.ROLE),
    getTenantName: () => storageEngine.getItem(KEYS.TENANT_NAME) || 'Authorized Tenant',
    getTenantID: () => storageEngine.getItem(KEYS.TENANT_ID),
    // Checkers
    isSuperAdmin: () => storageEngine.getItem(KEYS.ROLE) === 'SuperAdmin',
    isTenant: () => storageEngine.getItem(KEYS.ROLE) === 'Tenant',
    isRental: () => storageEngine.getItem(KEYS.ROLE) === 'Rental',
    getUserId: () => storageEngine.getItem(KEYS.USER_ID),

    setLoginData: (data: any, remember: boolean) => {
        const engine = remember ? localStorage : sessionStorage;
        engine.setItem(KEYS.TOKEN, data.token);
        engine.setItem(KEYS.ROLE, data.role);
        engine.setItem(KEYS.TENANT_ID, data.tenantId);
        engine.setItem(KEYS.USER_ID, data.userId);
        if (data.tenantName) engine.setItem(KEYS.TENANT_NAME, data.tenantName);
    },

    // clear already handled in app.tsx
};