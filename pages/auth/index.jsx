import useAuth from "../../hooks/useAuth";

export default function Auth() {
  const { auth_url } = useAuth();

  return (
    <div>
      <a href={`${auth_url}&identity_provider=Google`}>
        <div><button>Login with Google</button></div>
      </a>
      <a href={`${auth_url}&identity_provider=Facebook`}>
        <div><button>Login with Facebook</button></div>
      </a>
      <a href={`${auth_url}&identity_provider=SignInWithApple`}>
        <div><button>Login with Apple</button></div>
      </a>
      <a href={`${auth_url}&identity_provider=LoginWithAmazon`}>
        <div><button>Login with Amazon</button></div>
      </a>
    </div>
  )
}