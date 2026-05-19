

const KEYS = {
    TOKEN: 'token',
    ROLE: 'role',
    TENANT_ID: 'tenantId',
    TENANT_NAME: 'tenantName',
    USER_ID: 'userId'
};

// Change this from a 'const' to a function
const getStorage = () => localStorage.getItem(KEYS.TOKEN) ? localStorage : sessionStorage;

export const storage = {
    get: (key: string) => getStorage().getItem(key),
    getToken: () => getStorage().getItem(KEYS.TOKEN),
    getRole: () => getStorage().getItem(KEYS.ROLE),
    getTenantName: () => getStorage().getItem(KEYS.TENANT_NAME) || 'Authorized Tenant',
    getTenantID: () => getStorage().getItem(KEYS.TENANT_ID),
    getUserId: () => getStorage().getItem(KEYS.USER_ID),

    isSuperAdmin: () => getStorage().getItem(KEYS.ROLE) === 'SuperAdmin',
    isTenant: () => getStorage().getItem(KEYS.ROLE) === 'Tenant',

    setLoginData: (data: any, remember: boolean) => {
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