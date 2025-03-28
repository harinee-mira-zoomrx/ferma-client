import { get } from 'svelte/store';
import { token } from '../stores/auth.store';
import * as msal from '@azure/msal-browser';

class MSALAuth {
    #instance;
    constructor(clientId, tenantId, redirectURI, scopes = ["User.Read"]) {
        this.config = {
            auth: {
                clientId,
                tenantId,
                authority: `https://login.microsoftonline.com/${tenantId}`,
                redirectUri: redirectURI,
                navigateToLoginRequestUrl: true,
                scopes: ['openid', 'profile', 'offline_access'],
                logoutURL: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`,
            },
            cache: {
                cacheLocation: "sessionStorage",
                storeAuthStateInCookie: true,
            },
        };
        this.scopes = scopes;
        this.initializing = this.init();
        this.tokenRefreshPromise = null;
    }

    async init() {
        try {
            this.#instance = new msal.PublicClientApplication(this.config);
            await this.#instance.initialize();
        } catch (e) {
            this.#instance = null;
            console.error("Failed to initialize MSAL", e);
        }
    }

    async #isInitialized() {
        await this.initializing;
        if (this.#instance == null) {
            throw new Error("MSAL Not initialized");
        }
        return true;
    }

    async #getCurrentAccount(response) {
        await this.#isInitialized();
        let currentSession = {};
        
        if (response !== null) {
            currentSession = response;
        } else {
            const currentAccounts = this.#instance.getAllAccounts();
            
            if (currentAccounts.length === 1) {
                return currentAccounts[0];
            }
            throw new Error("Multiple accounts present");
        }
        return currentSession;
    }

    async authenticate() {
        try {
            await this.#isInitialized();
            const redirect_response = await this.#instance.handleRedirectPromise();
            const response = await this.#getCurrentAccount(redirect_response);
            if (response.accessToken == null) {
                await this.#refreshToken();
            } else {
                token.set({
                    idToken: response.idToken,
                    accessToken: response.accessToken,
                    expiration_time: new Date(response.expiresOn),
                });
            }
        } catch (error) {
            console.error("Token fetch failed", error);
            await this.#instance.loginRedirect({ scopes: this.scopes });
        }
    }

    async #refreshToken(){
        try {
            await this.#isInitialized();
            const currentAccount = await this.#getCurrentAccount(null);
            const response = await this.#instance.acquireTokenSilent({
                scopes: this.scopes,
                account : currentAccount,
            })

            token.set({
                idToken: response.idToken,
                accessToken: response.accessToken,
                expiration_time: new Date(response.expiresOn)
            })
            return response.idToken;
        } catch (error) {
            console.error("Token refresh failed", error);
            throw error;
        }
    }

    async getIdToken() {
        await this.#isInitialized();
        const currentToken = get(token);

        const expirationTime = new Date(currentToken?.expiration_time);
        if (expirationTime > new Date()) {
            return currentToken.idToken;
        }

        if (this.tokenRefreshPromise) {
            return this.tokenRefreshPromise;
        }

        this.tokenRefreshPromise = this.#refreshToken()
            .catch(err => this.#instance.loginRedirect({ scopes: this.scopes }))
            .finally(() => {
                this.tokenRefreshPromise = null;
            });

        return this.tokenRefreshPromise;
    }
} 

export const msal_auth = new MSALAuth(
    import.meta.env.VITE_MSAL_CLIENT_ID,
    import.meta.env.VITE_MSAL_TENANT_ID, 
    import.meta.env.VITE_MSAL_REDIRECT_URI
);