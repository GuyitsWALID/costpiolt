import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calculator, 
  BarChart3, 
  Plus, 
  Settings, 
  User as UserIcon, 
  LogOut,
  CreditCard
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Project } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';
import ProjectList from './ProjectList';
import ProjectCreateForm from './ProjectCreateForm';

interface SidebarProps {
  projects: Project[];
  onProjectCreated: () => void;
  onProjectSelect: (projectId: string) => void;
  selectedProjectId: string | null;
  user: User;
}

export default function Sidebar({ 
  projects, 
  onProjectCreated, 
  onProjectSelect, 
  selectedProjectId, 
  user 
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

  return (
    <>
      <div className="w-72 bg-slate-900 text-white p-4 h-screen fixed left-0 top-0 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <Calculator className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold">CostPilot</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600 text-white font-medium"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/budget"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CreditCard className="h-5 w-5" />
            <span>Budget Tool</span>
          </Link>
          <Link
            href="/#pricing"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Calculator className="h-5 w-5" />
            <span>Pricing</span>
          </Link>
        </nav>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Projects
            </h3>
            <button
              data-create-project
              onClick={() => setShowCreateForm(true)}
              className="p-1 rounded-md hover:bg-slate-800 transition-colors"
              title="Create new project"
            >
              <Plus className="h-4 w-4 text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Create Project Button */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg border-2 border-dashed border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors mb-4"
          >
            <Plus className="h-5 w-5" />
            <span>New Project</span>
          </button>

          {/* Projects List */}
          <ProjectList 
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectSelect={onProjectSelect}
          />
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Link
            href="/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 px-3 py-2 border-t border-slate-700 pt-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-slate-400">
                {user.user_metadata?.full_name || 'User'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded-md hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-slate-400 hover:text-white" />
            </button>
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