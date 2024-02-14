import React, { useState } from 'react';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);


  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/invalid-credential':
        return 'Incorrect password or email. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/email-already-in-use':
        return 'Email is already in use with another account.';
      // Add more cases as needed
      default:
        return 'Login failed. Please try again.';
    }
  };
  

  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError(null);
    } catch (error) {
      const friendlyMessage = getErrorMessage(error.code);
      setLoginError(friendlyMessage);
    }
  };

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className=" p-44 h-screen w-full bg-white rounded-md shadow-md">
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
          className="w-full px-4 py-2 text-white bg-purple-500 rounded-md hover:bg-purple-600"
        >
          Login
        </button>
      </form>
      {loginError && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {loginError}</span>
        </div>
      )}
      <div className="mt-10 flex justify-around">
        <button
          className="px-3 py-1 text-white bg-purple-900 rounded-md hover:bg-purple-600"
          onClick={() => openLink('https://airlight.pro/signup')}
        >
          Signup
        </button>
        <button
          className="px-3 py-1 text-white bg-purple-900 rounded-md hover:bg-purple-600"
          onClick={() => openLink('https://buy.stripe.com/9AQcNC3ib0Zv6xGcMM')}
        >
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default Login;
