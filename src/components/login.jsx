import React, { useState, useContext } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import AppLogo from "../assets/icon.png";
import LangInterfaceContext from "../contexts/langfacecontext";

export function Login({ onLogin, switchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
    const {
      setLangInterfaceVisible,
    } = useContext(LangInterfaceContext);

  const showAlert = (message) => {
    setCustomAlert({ visible: true, message });
    setTimeout(() => {
      setCustomAlert({ visible: false, message: "" });
    }, 750);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showAlert("Logged in successfully.");
      setLangInterfaceVisible(true);
      onLogin();
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        showAlert("User not found. Please check your email address.");
      } else if (error.code === "auth/invalid-email") {
        showAlert("Invalid email address. Please enter a valid email.");
      } else if (error.code === "auth/wrong-password") {
        showAlert("Incorrect password. Please try again.");
      } else {
        showAlert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showAlert("Password reset link sent to your email.");
      setShowResetDialog(false);
    } catch (error) {
      showAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <>
      {customAlert.visible && (
        <div className="fixed z-50 top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full flex items-center space-x-4">
            <img src={AppLogo} alt="App Logo" className="h-10 w-10" />
            <span className="text-gray-800 font-medium">
              {customAlert.message}
            </span>
          </div>
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {!showResetDialog && (
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-700">
                Log in to your account
              </h2>
            </div>
            <form
              onSubmit={handleLogin}
              onKeyDown={handleKeyDown}
              className="mt-8 space-y-5">
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    required
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute z-20 right-3 top-2 text-gray-600 focus:outline-none">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    loading
                      ? "bg-indigo-500"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
                  {loading ? "Loading..." : "Log in"}
                </button>
              </div>
              <div className="flex justify-between">
                <div>
                  <button onClick={switchToSignUp} className="font-medium">
                    <span className="text-neutral-600 font-light">
                      Don't have an account?
                    </span>
                    <span className="text-indigo-600 hover:text-indigo-500 ">
                      {" "}
                      Sign up
                    </span>
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setShowResetDialog(true)}
                    className="text-sm text-indigo-600 font-light hover:text-blue-500">
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        {showResetDialog && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="bg-neutral-100 rounded-lg w-full max-w-md mx-auto py-8 px-4">
                <h3 className="text-2xl font-medium text-gray-900 mb-4">
                  Reset Password
                </h3>
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <input
                      type="email"
                      placeholder="Email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowResetDialog(false)}
                      className="text-indigo-600 hover:text-indigo-500">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 ${
                        loading
                          ? "bg-indigo-500"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

