import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { ProjectListPage } from './pages/ProjectListPage';
import { SettingsPage } from './pages/SettingsPage';
import { EditorPage } from './pages/EditorPage';
import { ComparePage } from './pages/ComparePage';

const App: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [exportHandlers, setExportHandlers] = useState<{
    onExportPng?: () => void;
    onExportJson?: () => void;
    onExportK6?: () => void;
    onSave?: () => void;
    onSaveVersion?: () => void;
    onShowVersionHistory?: () => void;
  }>({});

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Require Authentication */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen overflow-hidden bg-background text-white font-sans">
                  <Header 
                    isSimulating={isSimulating}
                    onToggleSimulate={() => setIsSimulating(prev => !prev)}
                    onExportPng={exportHandlers.onExportPng}
                    onExportJson={exportHandlers.onExportJson}
                    onExportK6={exportHandlers.onExportK6}
                    onSave={exportHandlers.onSave}
                    onSaveVersion={exportHandlers.onSaveVersion}
                    onShowVersionHistory={exportHandlers.onShowVersionHistory}
                  />
                  <Routes>
                    <Route path="/" element={<Navigate to="/projects" replace />} />
                    <Route path="/projects" element={<ProjectListPage />} />
                    <Route 
                      path="/editor" 
                      element={
                        <EditorPage 
                          isSimulating={isSimulating}
                          setIsSimulating={setIsSimulating}
                          setExportHandlers={setExportHandlers}
                        />
                      } 
                    />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                  <ToastContainer />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;