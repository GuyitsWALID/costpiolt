"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calculator, 
  BarChart3, 
  Plus, 
  Settings, 
  User as UserIcon, 
  LogOut,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Project } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';
import ProjectList from './ProjectList';
import ProjectCreateForm from './ProjectCreateForm';

type ViewType = 'projects' | 'budget' | 'settings';

interface SidebarProps {
  projects: Project[];
  onProjectCreated: () => void;
  onProjectSelect: (projectId: string) => void;
  selectedProjectId: string | null;
  user: User;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ 
  projects, 
  onProjectCreated, 
  onProjectSelect, 
  selectedProjectId, 
  user,
  isCollapsed,
  onToggleCollapse,
  currentView,
  onViewChange
}: SidebarProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleProjectCreated = () => {
    setShowCreateForm(false);
    onProjectCreated();
  };

  const handleViewChange = (view: ViewType) => {
    onViewChange(view);
  };

  return (
    <>
      <div className={`bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-r border-gray-200 dark:border-slate-800 fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Logo and Toggle */}
        <div className={`flex items-center p-4 ${isCollapsed ? 'flex-col space-y-3' : 'justify-between'} mb-8 border-b border-gray-200 dark:border-slate-700`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <Calculator className={`${isCollapsed ? 'h-6 w-6' : 'h-6 w-6'} text-blue-500 dark:text-blue-400`} />
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">CostPilot</span>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8 px-4">
          <button
            onClick={() => handleViewChange('projects')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors ${
              currentView === 'projects' 
                ? 'bg-blue-600 text-white font-medium' 
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Dashboard"
          >
            <BarChart3 className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
            {!isCollapsed && <span>Dashboard</span>}
          </button>
          <button
            onClick={() => handleViewChange('budget')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors ${
              currentView === 'budget' 
                ? 'bg-blue-600 text-white font-medium' 
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Budget Tool"
          >
            <CreditCard className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
            {!isCollapsed && <span>Budget Tool</span>}
          </button>
        </nav>

        {/* Projects Section */}
        {!isCollapsed && (
          <div className="mb-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-black-500 dark:text-slate-300 uppercase tracking-wider">
                Projects
              </h3>
              <button
                data-create-project
                onClick={() => setShowCreateForm(true)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Create new project"
              >
                <Plus className="h-4 w-4 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white" />
              </button>
            </div>

            {/* Create Project Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-400 dark:hover:border-slate-500 transition-colors mb-4"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>

            {/* Projects List */}
            <ProjectList 
              projects={projects}
              selectedProjectId={selectedProjectId}
              onProjectSelect={onProjectSelect}
            />
          </div>
        )}

        {/* Collapsed Projects Icon */}
        {isCollapsed && (
          <div className="mb-8 px-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
              title="New Project"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Bottom Section */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <button
            onClick={() => handleViewChange('settings')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors ${
              currentView === 'settings' 
                ? 'bg-blue-600 text-white font-medium' 
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Settings"
          >
            <Settings className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
            {!isCollapsed && <span>Settings</span>}
          </button>
          
          {/* User Profile */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 border-t border-gray-200 dark:border-slate-700 pt-4`}>
            {!isCollapsed ? (
              <>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <ProjectCreateForm
          onClose={() => setShowCreateForm(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </>
  );
}