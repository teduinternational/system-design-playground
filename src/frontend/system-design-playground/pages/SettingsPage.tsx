import React from 'react';
import { User, Bell, Palette, Shield, Monitor } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 bg-background flex overflow-hidden">
      {/* Settings Sidebar */}
      <aside className="w-64 bg-surface border-r border-border p-4">
        <h2 className="text-lg font-bold text-white mb-6 px-2">Settings</h2>
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium">
            <User className="w-4 h-4" />
            Account
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-secondary hover:text-white hover:bg-surface-hover rounded-md text-sm font-medium transition-colors">
            <Palette className="w-4 h-4" />
            Appearance
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-secondary hover:text-white hover:bg-surface-hover rounded-md text-sm font-medium transition-colors">
            <Bell className="w-4 h-4" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-secondary hover:text-white hover:bg-surface-hover rounded-md text-sm font-medium transition-colors">
            <Shield className="w-4 h-4" />
            Security
          </button>
        </nav>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl space-y-8">
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                <div>
                  <button className="text-sm bg-surface-hover border border-border text-white px-3 py-1.5 rounded hover:bg-border transition-colors">
                    Change Avatar
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-secondary">First Name</label>
                  <input type="text" className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:border-primary outline-none" defaultValue="Alex" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-secondary">Last Name</label>
                  <input type="text" className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:border-primary outline-none" defaultValue="Designer" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary">Email Address</label>
                <input type="email" className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm focus:border-primary outline-none" defaultValue="alex@systemplay.io" />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-4">Editor Preferences</h3>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded">
                    <Monitor className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Snap to Grid</p>
                    <p className="text-xs text-secondary">Automatically align nodes to grid lines</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-primary rounded-full relative cursor-pointer">
                  <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></span>
                </div>
              </div>

              <div className="h-px bg-border"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded">
                    <Palette className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">High Contrast Edges</p>
                    <p className="text-xs text-secondary">Improve visibility of connections</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-border rounded-full relative cursor-pointer">
                  <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-gray-400 rounded-full"></span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};
