import { TokenSet } from "next-auth";
import NextAuth from "next-auth/next";
import { Provider } from "next-auth/providers";

const { 
  NEXTAUTH_URL,
  COGNITO_REGION,
  COGNITO_DOMAIN,
  COGNITO_CLIENT_ID,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_SECRET,
} = process.env;

type TProvider = "Amazon" | "Apple" | "Facebook" | "Google";

function getProvider(provider: TProvider): Provider {
  return {
    id: `cognito_${provider.toLowerCase()}`,  // e.g. cognito_google | cognito_facebook
    name: `Cognito${provider}`, // e.g. CognitoGoogle | CognitoFacebook
    type: "oauth",
    clientId: COGNITO_CLIENT_ID,
    clientSecret: COGNITO_CLIENT_SECRET,
    wellKnown: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/openid-configuration`,
    checks: ["nonce"],
    authorization: {
      url: `${COGNITO_DOMAIN}/oauth2/authorize`,
      params: {
        response_type: "code",
        client_id: COGNITO_CLIENT_ID,
        identity_provider: provider,
        redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/cognito_${provider.toLowerCase()}`
      }
    },
    token: {
      url: `${COGNITO_DOMAIN}/oauth2/token`,
      params: {
        grant_type: "authorization_code",
        client_id: COGNITO_CLIENT_ID,
        client_secret: COGNITO_CLIENT_SECRET,
        redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/cognito_${provider.toLowerCase()}`
      }
    },
    userinfo: {
      url: `${COGNITO_DOMAIN}/oauth2/userInfo`,
    },
    profile: function(profile) {
      return {
        id: profile.sub,
        ...profile
      }
    }
  }
}

export const authOptions = {
  providers: [
    ...["Amazon", "Apple", "Facebook", "Google"].map((provider: TProvider) => getProvider(provider)),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Return true to allow sign in and false to block sign in.
      return true;
    },
    async redirect({ url, baseUrl }){
      // Return the url to redirect to after successful sign in.
      return baseUrl;
    },
    async jwt({ token, account, profile, user }){
      if (account) {
        // This is an initial login, set JWT tokens.
        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          tokenType: 'Bearer'
        }
      }
      if (Date.now() < token.expiresAt) {
        // Access/Id token are still valid, return them as is.
        return token;
      }
      // Access/Id tokens have expired, retrieve new tokens using the refresh token
      try {
        const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: COGNITO_CLIENT_ID,
            client_secret: COGNITO_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken
          }),
          method: "POST"
        })

        const tokens: TokenSet = await response.json();

        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          expiresAt: Date.now() + (Number(tokens.expires_in) * 1000)
        }
      } catch (error) {
        // Could not refresh tokens, return error
        console.error("Error refreshing access and id tokens: ", error);
        return { ...token, error: "RefreshTokensError" as const }
      }
    },
    async session({ session, token }) {
      /* 
        Forward tokens to client in case you need to make authorized API calls 
        to an AWS service directly from the front end.
      */
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      /* 
        If there is an error when refreshing tokens, include it so it can 
        be forwarded to the front end.
      */
     session.error = token.error;
      return session;
    }
  }
};

export default NextAuth(authOptions);