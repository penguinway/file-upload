import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './upload/upload';
import Filelist from './filelist/file';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/list" element={<Filelist />} />
      </Routes>
    </Router>
  );
};

export default App;
