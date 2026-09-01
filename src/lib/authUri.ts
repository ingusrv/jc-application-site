import { env } from "$env/dynamic/public";

export const authRedirectUrl = env.PUBLIC_ENABLE_AUTH === "true"
    ? "/.auth/login/aad?post_login_redirect_uri=/pieteikumi"
    : "/pieteikumi";