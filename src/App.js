import React from 'react';
import { AskBar } from './components/askbar';
import { DragArea } from './components/dragarea';
import { Results } from './components/results';
import { TopBar } from './components/topbar';

function App() {

  return (
    <div>
      <DragArea />
      <AskBar />
      <TopBar />
      <Results />
    </div>
  );
}

export default App;
