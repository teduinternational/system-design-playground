import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ProjectListPage } from './pages/ProjectListPage';
import { SettingsPage } from './pages/SettingsPage';
import { EditorPage } from './pages/EditorPage';

const App: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-white font-sans">
        <Header 
          isSimulating={isSimulating}
          onToggleSimulate={() => setIsSimulating(!isSimulating)}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/editor" element={<EditorPage isSimulating={isSimulating} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;