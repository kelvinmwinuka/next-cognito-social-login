import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

export default function SignIn() {
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    getProviders().then((providers) => setProviders(providers));
  }, []);

  return (
    <div>
      {providers && (
        <>
          <div>
            <button onClick={() => signIn(providers["cognito_amazon"].id)}>
              Login with Amazon
            </button>
          </div>
          <div>
            <button onClick={() => signIn(providers["cognito_apple"].id)}>
              Login with Apple
            </button>
          </div>
          <div>
            <button onClick={() => signIn(providers["cognito_facebook"].id)}>
              Login with Facebook
            </button>
          </div>
          <div>
            <button onClick={() => signIn(providers["cognito_google"].id)}>
              Login with Google
            </button>
          </div>
        </>
      )}
    </div>
  );
}
