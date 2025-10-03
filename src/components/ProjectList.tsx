"use client";

import { format } from 'date-fns';
import { FileText, ChevronRight } from 'lucide-react';
import type { Project } from '@/lib/supabaseClient';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
}

export default function ProjectList({ 
  projects, 
  selectedProjectId, 
  onProjectSelect 
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-slate-400">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No projects yet</p>
        <p className="text-xs mt-1">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;
        
        return (
          <button
            key={project.id}
            onClick={() => onProjectSelect(project.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors group ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-800 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <h4 className="font-medium truncate text-sm">
                    {project.name}
                  </h4>
                </div>
                
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isSelected 
                      ? 'bg-blue-500 text-blue-100' 
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
                  }`}>
                    {project.project_type}
                  </span>
                  {project.budget && (
                    <span className={`${isSelected ? 'text-blue-100' : 'text-gray-600 dark:text-slate-400'}`}>
                      ${(project.budget / 1000).toFixed(0)}k
                    </span>
                  )}
                  <span className={`${isSelected ? 'text-blue-100' : 'text-gray-600 dark:text-slate-400'}`}>
                    {format(new Date(project.created_at), 'MMM d')}
                  </span>
                </div>
              </div>
              
              <ChevronRight className={`h-4 w-4 transition-transform ${
                isSelected ? 'rotate-90' : 'group-hover:translate-x-1'
              }`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}