import { useEffect } from "react";
import { useRouter } from "next/router";

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;

const AUTH_URL = `${COGNITO_DOMAIN}/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
const TOKEN_URL = `${COGNITO_DOMAIN}/oauth2/token?grant_type=authorization_code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${CLIENT_SECRET}`;

export default function useAuth(){
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    if (code) {
      // Fetch user details using authorization code returned
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
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      })
    }
  }, [code])

  return {
    auth_url: AUTH_URL
  }
}