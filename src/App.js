import React from 'react';
import { AskBar } from './components/askbar';
import { DragArea } from './components/dragarea';
import { Results } from './components/results';
import { TopBar } from './components/topbar';
import { UpdateNotifications } from './components/updates';

function App() {

  return (
    <div>
      <DragArea />
      <AskBar />
      <TopBar />
      <Results />
      <UpdateNotifications />
    </div>
  );
}

export default App;
