"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
	Calculator, 
	Plus, 
	Menu, 
	X, 
	Settings,
	BarChart3,
	LogOut,
	User2Icon,
	Telescope
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Project } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';
import ProjectList from './ProjectList';
import EnterpriseProjectForm from '@/components/EnterpriseProjectForm';
import { MaterialThemeProvider } from './MaterialThemeProvider';

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
	isMobileMenuOpen?: boolean;
	setIsMobileMenuOpen?: (open: boolean) => void;
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
	onViewChange,
	isMobileMenuOpen = false,
	setIsMobileMenuOpen
}: SidebarProps) {
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const router = useRouter();

	// Check if we're on mobile
	useEffect(() => {
		const checkMobile = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Close mobile menu when route changes
	useEffect(() => {
		if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
	}, [currentView, setIsMobileMenuOpen]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push('/');
	};

	const handleProjectCreated = () => {
		setShowCreateDialog(false);
		onProjectCreated();
	};

	const handleCreateProjectSuccess = (projectId: string) => {
		handleProjectCreated();
		// Navigate to the new project's budget editor
		router.push(`/projects/${projectId}/budget-editor`);
	};

	const handleViewChange = (view: ViewType) => {
		onViewChange(view);
		// if mobile, also close mobile menu when provided
		if (isMobile && setIsMobileMenuOpen) setIsMobileMenuOpen(false);
	};

	const handleNewProject = () => {
		// Check project limit for free tier users
		if (projects.length >= 2) {
			setShowUpgradeModal(true);
			return;
		}
		setShowCreateDialog(true);
	};

	const handleProjectSelect = (projectId: string) => {
		onProjectSelect(projectId);
		if (isMobile && setIsMobileMenuOpen) setIsMobileMenuOpen(false);
	};

	// safe mobile toggle: guard optional setter
	const toggleMobileMenuSafe = () => {
		if (setIsMobileMenuOpen) {
			setIsMobileMenuOpen(!isMobileMenuOpen);
		}
	};

	return (
		<>
			{/* Mobile Overlay - Now closes sidebar on click */}
			{isMobile && isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
					onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar - Fixed positioning for proper layout */}
			<div
				className={`
          fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50 flex flex-col
          ${isMobile 
            ? `w-80 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : `${isCollapsed ? 'w-20' : 'w-72'} translate-x-0`
          }
        `}
			>
				{/* Logo and Toggle - Mobile close button removed */}
				<div className={`flex items-center p-4 mb-6 md:mb-8 border-b border-gray-200 dark:border-slate-700 ${isMobile ? 'justify-between' : isCollapsed ? 'flex-col space-y-3 justify-center' : 'justify-between'}`}>
					<div className={`flex items-center ${isCollapsed && !isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
						<Calculator className={`${isCollapsed && !isMobile ? 'h-6 w-6' : 'h-6 w-6'} text-blue-500 dark:text-blue-400`} />
						{(!isCollapsed || isMobile) && <span className="text-xl font-bold text-gray-900 dark:text-white">CostPilot</span>}
					</div>

					{/* Desktop toggle button only */}
					{!isMobile && (
						<button
							onClick={onToggleCollapse}
							className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
							title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						>
							{isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-4 w-4" />}
						</button>
					)}
				</div>

				{/* Navigation */}
				<nav className="space-y-2 mb-6 md:mb-8 px-4">
					<button
						onClick={() => handleViewChange('projects')}
						className={`w-full flex items-center ${isCollapsed && !isMobile ? 'justify-center py-3' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors ${
							currentView === 'projects' ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
						}`}
						title="Dashboard"
					>
						<BarChart3 className={`${isCollapsed && !isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
						{(!isCollapsed || isMobile) && <span>Dashboard</span>}
					</button>

					<button
						onClick={() => handleViewChange('budget')}
						className={`w-full flex items-center ${isCollapsed && !isMobile ? 'justify-center py-3' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors ${
							currentView === 'budget' ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
						}`}
						title="Budget Tool"
					>
						<Telescope  className={`${isCollapsed && !isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
						{(!isCollapsed || isMobile) && <span>Budget Tool</span>}
					</button>
				</nav>

				{/* Projects Section */}
				{(!isCollapsed || isMobile) && (
					<div className="mb-6 md:mb-8 px-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-semibold text-black-500 dark:text-slate-300 uppercase tracking-wider">Projects</h3>
							<button
								data-create-project
								onClick={handleNewProject}
								className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
								title="Create new project"
							>
								<Plus className="h-4 w-4 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white" />
							</button>
						</div>

						{/* Create Project Button */}
						<button
							onClick={handleNewProject}
							className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-400 dark:hover:border-slate-500 transition-colors mb-4"
						>
							<Plus className="h-4 w-4" />
							<span>New Project</span>
						</button>

						{/* Projects List */}
						<div className="max-h-64 md:max-h-80 overflow-y-auto">
							<ProjectList projects={projects} selectedProjectId={selectedProjectId} onProjectSelect={handleProjectSelect} />
						</div>
					</div>
				)}

				{/* Collapsed Projects Icon (Desktop only) */}
				{isCollapsed && !isMobile && (
					<div className="mb-8 px-4">
						<button
							onClick={handleNewProject}
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
						className={`w-full flex items-center ${isCollapsed && !isMobile ? 'justify-center py-3' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors ${
							currentView === 'settings' ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
						}`}
						title="Settings"
					>
						<Settings className={`${isCollapsed && !isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
						{(!isCollapsed || isMobile) && <span>Settings</span>}
					</button>

					{/* User Profile */}
					<div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'} px-3 py-2 border-t border-gray-200 dark:border-slate-700 pt-4`}>
						{(!isCollapsed || isMobile) ? (
							<>
								<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
									<User2Icon className="h-4 w-4 text-white" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name || 'User'}</p>
									<p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
								</div>
								<button onClick={handleLogout} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0" title="Sign out">
									<LogOut className="h-4 w-4 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white" />
								</button>
							</>
						) : (
							<button onClick={handleLogout} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" title="Sign out">
								<LogOut className="h-5 w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white" />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Create Project Dialog - Enterprise form */}
			<MaterialThemeProvider>
				<EnterpriseProjectForm open={showCreateDialog} onClose={() => setShowCreateDialog(false)} onSuccess={handleCreateProjectSuccess} projectCount={projects.length} />
			</MaterialThemeProvider>

			{/* Upgrade Modal */}
			{showUpgradeModal && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowUpgradeModal(false)} />
						<span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
						<div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
							<div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="text-center mb-6 md:mb-8">
									<div className="mx-auto flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
										<Plus className="h-6 w-6 md:h-8 md:w-8 text-white" />
									</div>
									<h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
										Upgrade to Unlock More
									</h3>
									<p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
										You have reached the limit of 2 projects on the free tier. Choose a plan that fits your needs and unlock unlimited potential.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 px-4">
									{/* Free Plan - Current */}
									<div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-600 relative">
										<div className="absolute top-4 right-4">
											<span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
												Current Plan
											</span>
										</div>
										
										<h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">Free</h4>
										<div className="mb-4">
											<span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">$0</span>
											<span className="text-gray-500 dark:text-gray-400">/month</span>
										</div>
										
										<ul className="space-y-2 md:space-y-3 mb-6 text-sm">
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Up to 2 projects</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Basic Budget Tracking</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Email Support</span>
											</li>
										</ul>
										
										<button
											disabled
											className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-2 md:py-3 px-4 rounded-lg cursor-not-allowed text-sm"
										>
											Current Plan
										</button>
									</div>

									{/* Pro Plan */}
									<div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 md:p-6 border-2 border-blue-200 dark:border-blue-700 md:transform md:scale-105">
										<div className="absolute top-4 right-4">
											<span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
												Most Popular
											</span>
										</div>
										
										<h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">Pro</h4>
										<div className="mb-4">
											<span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">$19</span>
											<span className="text-gray-500 dark:text-gray-400">/month</span>
										</div>
										
										<ul className="space-y-2 md:space-y-3 mb-6 text-sm">
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Unlimited Projects</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Advanced Analytics</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Priority Support</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Export Data</span>
											</li>
										</ul>
										
										<button
											onClick={() => {
												window.open('https://polar.sh/checkout/3bdd0f57-bac5-4190-8847-f48681c18e43', '_blank');
												setShowUpgradeModal(false);
											}}
											className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 md:py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 md:transform md:hover:scale-105 shadow-lg text-sm"
										>
											Upgrade to Pro
										</button>
										<p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
											7-day free trial • Cancel anytime
										</p>
									</div>

									{/* Enterprise Plan */}
									<div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
										<h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h4>
										<div className="mb-4">
											<span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">$49</span>
											<span className="text-gray-500 dark:text-gray-400">/month</span>
										</div>
										
										<ul className="space-y-2 md:space-y-3 mb-6 text-sm">
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Everything in Pro</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Team Collaboration</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Custom Integrations</span>
											</li>
											<li className="flex items-center">
												<svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
												</svg>
												<span className="text-gray-700 dark:text-gray-300">Dedicated Support</span>
											</li>
										</ul>
										
										<button
											onClick={() => {
												window.open('https://polar.sh/checkout/3bdd0f57-bac5-4190-8847-f48681c18e43', '_blank');
												setShowUpgradeModal(false);
											}}
																						className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 md:py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg text-sm"
																					>
																						Contact Sales
																					</button>
																				</div>
																			</div>
																		</div>
																		<div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
																			<button
																				type="button"
																				onClick={() => setShowUpgradeModal(false)}
																				className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
																			>
																				Close
																			</button>
																		</div>
																	</div>
																</div>
															</div>
														)}
													</>
												);
											}