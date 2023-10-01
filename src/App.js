import React from 'react';
import { AskBar } from './components/askbar';
import { DragArea } from './components/dragarea';
import { ShortcutChange } from './components/shortcutchange';

function App() {

    return (
      <div>
        
        <DragArea/>
        <ShortcutChange />
        <AskBar />
      </div>
    );

}

export default App;
