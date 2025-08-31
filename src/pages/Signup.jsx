import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AnimatedPage from "../components/AnimatedPage";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAlreadyLoggedInRedirect } from "../context/useAlreadyLoggedInRedirect";

export default function Signup() {
  const { signup, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleDemo = () => {
    demoLogin()
    navigate('/dashboard')
  }

  const handleSignup = (e) => {
    e.preventDefault();
    try {
      signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };  

  useAlreadyLoggedInRedirect();

  return (
    <AnimatedPage>
      <div className="flex justify-center items-center h-[80vh]">
        <form onSubmit={handleSignup} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-80 space-y-4">
          <h2 className="text-2xl font-bold text-center dark:text-white">Sign Up</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
          
          <Button type="submit" fullWidth>
            Create Account
          </Button>
          <Button type="button" onClick={handleDemo} variant="secondary" fullWidth size="md">
            Quick demo login
          </Button>
          <p className="text-sm text-center dark:text-gray-300">
            Already have an account? <Link to="/login" className="underline">Login</Link>
          </p>
        </form>
      </div>
    </AnimatedPage>
  );
}
