import React from 'react';
import { AskBar } from './components/askbar';
import { DragArea } from './components/dragarea';
import { Results } from './components/results';
import { TopBar } from './components/topbar';
import { ShortcutChange } from './components/shortcutchange';

function App() {

  return (
    <div>
      <DragArea />
      <ShortcutChange />
      <AskBar />
      <TopBar />
      <Results />
    </div>
  );
}

export default App;

