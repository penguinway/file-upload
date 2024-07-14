import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './upload/upload';
import Filelist from './filelist/file';
import Clip from './clipboard/clipboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/list" element={<Filelist />} />
        <Route path='/clipboard' element={<Clip />} />
      </Routes>
    </Router>
  );
};

export default App;
