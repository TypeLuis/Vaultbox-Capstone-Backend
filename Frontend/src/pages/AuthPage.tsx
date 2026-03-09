import SignUp from "../components/Auth/Signup";
import LoginForm from "../components/Auth/Login";
import { useState } from "react";


export default function AuthPage() {
  const [newUser, setNewUser] = useState(false);
  return (
    <div>
      {newUser ? <SignUp setNewUser={setNewUser} /> : <LoginForm setNewUser={setNewUser} />}

    </div>
  );
}