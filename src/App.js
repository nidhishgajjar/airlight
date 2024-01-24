import React, { useState, useEffect } from 'react';
import { auth } from './firebase.js';
import { onAuthStateChanged } from "firebase/auth";

import { AskBar } from './components/askbar';
import { DragArea } from './components/dragarea';
import { ShortcutChange } from './components/shortcutchange';
import Login from './components/login';
import Signup from './components/signup'; // Assuming you have a Signup component

// Add some basic styles for centering and button design
const centerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh', // Use full viewport height to center vertically
};

const buttonStyle = {
  marginTop: '20px', // Space from the form
  padding: '10px 20px',
  fontSize: '16px',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  outline: 'none',
};

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const toggleAuthComponent = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div style={centerStyle}>
      {!user ? (
        <div>
          {showLogin ? (
            <>
              <Login />
              <button style={buttonStyle} onClick={toggleAuthComponent}>Go to Signup</button>
            </>
          ) : (
            <>
              <Signup />
              <button style={buttonStyle} onClick={toggleAuthComponent}>Go to Login</button>
            </>
          )}
        </div>
      ) : (
        <div>
          <DragArea />
          <ShortcutChange />
          <AskBar />
        </div>
      )}
    </div>
  );
}

export default App;