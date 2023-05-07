import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import AppLogo from "../assets/icon.png";

export function SignUp({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showAlert = (message) => {
    setCustomAlert({ visible: true, message });
    setTimeout(() => {
      setCustomAlert({ visible: false, message: "" });
    }, 3000); // Hide the alert after 3 seconds.
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: firstName,
      });

      await sendEmailVerification(userCredential.user);
      setLoading(false);
      showAlert(
        "Your account was successfully created. Login to continue."
      );

      setTimeout(() => {
        setLoading(false);
        switchToLogin();
      }, 1500);
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/invalid-email") {
        showAlert("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        showAlert("Password should be at least 8 characters long.");
      } else if (error.code === "auth/email-already-in-use") {
        showAlert("This email address is already in use.");
      } else {
        showAlert(error.message);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSignUp(e);
    }
  };

  return (
    <>
      {customAlert.visible && (
        <div className="fixed z-50 top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="bg-neutral-100 p-6 rounded shadow-lg max-w-sm w-full flex items-center space-x-4">
            <img src={AppLogo} alt="App Logo" className="h-10 w-10" />
            <span className="text-gray-800 font-medium">
              {customAlert.message}
            </span>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed z-50 top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="bg-neutral-100 p-6 rounded shadow-lg max-w-sm w-full flex items-center space-x-4">
            <img src={AppLogo} alt="App Logo" className="h-10 w-10" />
            <span className="text-gray-800 font-medium">
              Loading, please wait...
            </span>
          </div>
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <form
            onSubmit={handleSignUp}
            onKeyDown={handleKeyDown}
            className="mt-8 space-y-6">
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                  minLength="8"
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign Up
              </button>
            </div>
            <div>
              <button onClick={switchToLogin} className="font-medium">
                <span className="text-neutral-600 font-light">
                  Already have an account?
                </span>
                <span className="text-indigo-600 hover:text-indigo-500 ">
                  {" "}
                  Log in
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
