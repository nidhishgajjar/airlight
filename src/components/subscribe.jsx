import React from 'react';
import { auth } from '../firebase.js';
import { signOut } from "firebase/auth"; // Make sure to import signOut

const Subscribe = ({ setUser }) => { // Accept setUser as prop

    const handleSignOut = () => {
        signOut(auth).then(() => {
          setUser(null); // Use setUser to update the state in App component
        }).catch((error) => {
          console.error("Sign out error:", error);
        });
    };

    const openLink = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div className="p-44 h-screen w-full bg-white rounded-md shadow-md flex flex-col items-center justify-center">
            <div className="mb-10 text-xl font-semibold text-gray-800">
                Trial Expired
            </div>
            <div className="flex justify-around w-full max-w-md">
                <button
                className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                onClick={handleSignOut}
                >
                Go to Log In
                </button>
                <button
                className="px-4 py-2 text-white bg-purple-900 rounded-md hover:bg-purple-600"
                onClick={() => openLink('https://buy.stripe.com/9AQcNC3ib0Zv6xGcMM')}
                >
                Subscribe
                </button>
            </div>
        </div>
    );
};

export default Subscribe;
