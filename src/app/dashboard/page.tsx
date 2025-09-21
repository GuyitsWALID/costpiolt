"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Project } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { Calculator } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/auth');
        return;
      }
      
      setUser(session.user);
      await fetchProjects(session.access_token);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (accessToken: string) => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleProjectCreated = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      await fetchProjects(session.access_token);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar 
        projects={projects}
        onProjectCreated={handleProjectCreated}
        onProjectSelect={handleProjectSelect}
        selectedProjectId={selectedProjectId}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Top Bar */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">
                {selectedProject ? selectedProject.name : 'Dashboard'}
              </h1>
              {selectedProject && (
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                  {selectedProject.project_type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="p-6">
          {selectedProject ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Project Type</div>
                  <div className="text-lg font-semibold capitalize">{selectedProject.project_type.replace('_', ' ')}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Model Approach</div>
                  <div className="text-lg font-semibold capitalize">{selectedProject.model_approach.replace('_', ' ')}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Dataset Size</div>
                  <div className="text-lg font-semibold">{selectedProject.dataset_gb} GB</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                  <div className="text-sm font-medium text-muted-foreground">Monthly Tokens</div>
                  <div className="text-lg font-semibold">{selectedProject.monthly_tokens.toLocaleString()}</div>
                </div>
              </div>

              {selectedProject.description && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedProject.description}</p>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Budget Editor</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your project&apos;s budget parameters and get cost estimates.
                </p>
                <button
                  onClick={() => router.push(`/projects/${selectedProject.id}/budget-editor`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Budget Editor
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Welcome to CostPilot Dashboard</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select a project from the sidebar to view details and manage your AI budget forecasts, 
                or create a new project to get started.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => (document.querySelector('[data-create-project]') as HTMLButtonElement)?.click()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Your First Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}