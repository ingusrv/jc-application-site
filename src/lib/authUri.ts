import { PUBLIC_SWA_AUTH } from "$env/static/public";

export const authRedirectUri = PUBLIC_SWA_AUTH === "true" ? "/.auth/login/aad?post_login_redirect_uri=/pieteikumi" : "/pieteikumi";