

const KEYS = {
    TOKEN: 'token',
    ROLE: 'role',
    TENANT_ID: 'tenantId',
    TENANT_NAME: 'tenantName',
    USER_ID: 'userId'
};

const normalizeRole = (role: string | null | undefined) => (role ?? '').trim().toLowerCase();

const isSuperAdminRole = (role: string | null | undefined) => {
    const normalized = normalizeRole(role);
    return normalized === 'superadmin' || normalized === 'super admin';
};

const getStorage = () => {
    if (sessionStorage.getItem(KEYS.TOKEN)) return sessionStorage;
    if (localStorage.getItem(KEYS.TOKEN)) return localStorage;
    return sessionStorage;
};

export const storage = {
    get: (key: string) => getStorage().getItem(key),
    getToken: () => getStorage().getItem(KEYS.TOKEN),
    getRole: () => getStorage().getItem(KEYS.ROLE),
    getTenantName: () => getStorage().getItem(KEYS.TENANT_NAME) || 'Authorized Tenant',
    getTenantID: () => getStorage().getItem(KEYS.TENANT_ID),
    getUserId: () => getStorage().getItem(KEYS.USER_ID),

    isSuperAdmin: () => isSuperAdminRole(getStorage().getItem(KEYS.ROLE)),
    isTenant: () => normalizeRole(getStorage().getItem(KEYS.ROLE)) === 'tenant',
    isRenter: () => normalizeRole(getStorage().getItem(KEYS.ROLE)) === 'renter',

    setLoginData: (data: any, remember: boolean) => {
        Object.values(KEYS).forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        const engine = remember ? localStorage : sessionStorage;
        engine.setItem(KEYS.TOKEN, data.token);
        engine.setItem(KEYS.ROLE, data.role);
        engine.setItem(KEYS.TENANT_ID, data.tenantId);
        engine.setItem(KEYS.USER_ID, data.userId);
        if (data.tenantName) engine.setItem(KEYS.TENANT_NAME, data.tenantName);
    },

    clearLoginData: () => {
        Object.values(KEYS).forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    }
};