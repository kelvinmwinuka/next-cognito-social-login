import { useEffect } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";

export default function useAuth(){
  const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;

  const AUTH_URL = `${COGNITO_DOMAIN}/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  const TOKEN_URL = `${COGNITO_DOMAIN}/oauth2/token?grant_type=authorization_code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${CLIENT_SECRET}`;
  const USER_INFO_URL = `${COGNITO_DOMAIN}/oauth2/userInfo`;

  const router = useRouter();
  const { code } = router.query;

  const [cookies, setCookie, removeCookie] = useCookies(["access_token", "id_token", "refresh_token"]);

  useEffect(() => {
    if (code) {
      // Fetch user tokens using authorization code returned
      fetch(`${TOKEN_URL}&code=${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Something went wrong.");
      })
      .then(data => {
        setTokens(data);
      })
      .catch(err => {
        console.error(err);
      })
    }
  }, [code])

  const setTokens = (data) => {
    // data = { access_token: <string>, id_token: <string>, refresh_token: <string>, expires_in: <number> }
    Object.entries(data).forEach(([key, value]) => {
      if (["expires_in", "token_type"].includes(key)) return;
      setCookie(key, value, {
        // If it's a refresh token, expire in 30 days (or however long it's set in the app client).
        maxAge: key === "refresh_token" ? 60 * 60 * 24 * 30 : data.expires_in
      })
    });
    router.push("/");
  }

  const getUserInfo = () => {
    fetch(USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${cookies.access_token}`
      }
    })
    .then(res => {
      if (res.ok) return res.json()
      throw new Error("Could not retrieve user details");
    })
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.error(err);
    })
  }

  const loginWithRefreshToken = () => {

  }

  const logout = () => {

  }

  const revokeTokens = () => {
    
  }

  return {
    auth_url: AUTH_URL,
    getUserInfo
  }
}