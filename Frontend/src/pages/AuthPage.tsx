import SignUp from "../components/Signup";
import LoginForm from "../components/Login";
import { useState } from "react";

// type AuthPageProps = {
//   newUser: boolean;
//   setNewUser: React.Dispatch<React.SetStateAction<boolean>>;
// };

export default function AuthPage() {
  const [newUser, setNewUser] = useState(false);
  return (
    <div>
      {/* <h1>{newUser ? "Create account" : "Welcome back"}</h1> */}

      {newUser ? <SignUp setNewUser={setNewUser} /> : <LoginForm setNewUser={setNewUser} />}

      {/* <div>
        {newUser ? (
          <p>
            Already have an account?{" "}
            <button type="button" onClick={() => setNewUser(false)}>
              Log in
            </button>
          </p>
        ) : (
          <p>
            New here?{" "}
            <button type="button" onClick={() => setNewUser(true)}>
              Create account
            </button>
          </p>
        )}
      </div> */}
    </div>
  );
}