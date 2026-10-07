// JWT Authentication Helper & Fallback Token

export const DEFAULT_DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjI1MzQwMjMwMDc5OSwiaWF0IjoxNzAwMDAwMDAwfQ.ZIHh3hXJK09TDYKMlAAJeRaDwkSURn84tPnPc3tyC78';

export const getValidToken = () => {
    try {
        const stored = localStorage.getItem('token');
        if (stored && stored !== 'undefined' && stored !== 'null' && stored.trim() !== '') {
            const parts = stored.split('.');
            if (parts.length === 3) {
                try {
                    const payload = JSON.parse(atob(parts[1]));
                    if (!payload.exp || payload.exp * 1000 > Date.now()) {
                        return stored;
                    }
                } catch {
                    return stored;
                }
            }
        }
    } catch {
        // ignore
    }
    try {
        localStorage.setItem('token', DEFAULT_DEV_TOKEN);
    } catch {
        // ignore
    }
    return DEFAULT_DEV_TOKEN;
};
