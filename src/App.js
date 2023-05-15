import React, { useState, useEffect } from 'react';
import { AskBar } from './components/askbar';
import { DragArea } from './components/dragarea';
import { Results } from './components/results';
import { TopBar } from './components/topbar';
import { ShortcutChange } from './components/shortcutchange';
import { SignUp } from './components/signup';
import { Login } from './components/login';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsLoggedIn(true);
      } else { 
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleAuth = () => {
    setIsLoggedIn(true);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  const switchToSignUp = () => {
    setShowLogin(false);
  };

  if (isLoggedIn) {
    return (
      <div>
        <DragArea/>
        <ShortcutChange />
        <AskBar />
        <TopBar />
        <Results />
      </div>
    );
  }

  if (showLogin) {
    return <><DragArea/><Login onLogin={handleAuth} switchToSignUp={switchToSignUp} /></>;
  } else {
    return <><DragArea/><SignUp switchToLogin={switchToLogin} /></>;
  }
}

export default App;
