import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ProjectListPage } from './pages/ProjectListPage';
import { SettingsPage } from './pages/SettingsPage';
import { EditorPage } from './pages/EditorPage';

const App: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [exportHandlers, setExportHandlers] = useState<{
    onExportPng?: () => void;
    onExportJson?: () => void;
    onSave?: () => void;
  }>({});

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-white font-sans">
        <Header 
          isSimulating={isSimulating}
          onToggleSimulate={() => setIsSimulating(!isSimulating)}
          onExportPng={exportHandlers.onExportPng}
          onExportJson={exportHandlers.onExportJson}
          onSave={exportHandlers.onSave}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route 
            path="/editor" 
            element={
              <EditorPage 
                isSimulating={isSimulating}
                setExportHandlers={setExportHandlers}
              />
            } 
          />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;