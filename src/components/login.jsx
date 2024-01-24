import React, { useState } from 'react';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError(null);
      alert('Login successful');
    } catch (error) {
      setLoginError(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={login}>
        <input
          type="email"
          className="w-full px-4 py-2 mb-4 border rounded-md"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full px-4 py-2 mb-4 border rounded-md"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Login
        </button>
      </form>
      {loginError && (
        <p className="mt-4 text-center text-red-500">
          {loginError}
        </p>
      )}
    </div>
  );
};

export default Login;
