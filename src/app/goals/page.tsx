"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
	Target, 
	CheckCircle, 
	Clock, 
	TrendingUp,
	ChevronDown,
	ChevronUp,
	Check,
	X,
	Calendar,
	DollarSign
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import type { User } from '@supabase/supabase-js';

interface Goal {
	id: string;
	project_id: string;
	project_name: string;
	title: string;
	description: string;
	potential_savings: number;
	difficulty: 'easy' | 'medium' | 'hard';
	timeframe: string;
	implementation_steps: string[];
	status: 'pending' | 'in_progress' | 'completed';
	created_at: string;
	completed_at?: string;
}

export default function GoalsPage() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedGoals, setExpandedGoals] = useState<string[]>([]);
	const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession();
				if (!session?.user) {
					router.push('/auth');
					return;
				}
				setUser(session.user);

				// Fetch goals with project names
				const { data: goalsData, error } = await supabase
					.from('project_goals')
					.select(`
						*,
						projects (name)
					`)
					.eq('user_id', session.user.id)
					.order('created_at', { ascending: false });

				if (error) throw error;

				const formattedGoals = (goalsData || []).map(goal => ({
					id: goal.id,
					project_id: goal.project_id,
					project_name: goal.projects?.name || 'Unknown Project',
					title: goal.title,
					description: goal.description,
					potential_savings: goal.potential_savings,
					difficulty: goal.difficulty,
					timeframe: goal.timeframe,
					implementation_steps: goal.implementation_steps,
					status: goal.status,
					created_at: goal.created_at,
					completed_at: goal.completed_at
				}));

				setGoals(formattedGoals);
			} catch (error) {
				console.error('Error:', error);
				router.push('/auth');
			} finally {
				setLoading(false);
			}
		};

		initializeAuth();
	}, [router]);

	const toggleGoal = (goalId: string) => {
		setExpandedGoals(prev => 
			prev.includes(goalId) 
				? prev.filter(id => id !== goalId)
				: [...prev, goalId]
		);
	};

	const updateGoalStatus = async (goalId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
		try {
			const updateData: any = { status: newStatus };
			if (newStatus === 'completed') {
				updateData.completed_at = new Date().toISOString();
			}

			const { error } = await supabase
				.from('project_goals')
				.update(updateData)
				.eq('id', goalId);

			if (error) throw error;

			setGoals(prev => prev.map(goal => 
				goal.id === goalId 
					? { ...goal, status: newStatus, ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}) }
					: goal
			));
		} catch (error) {
			console.error('Error updating goal:', error);
			alert('Failed to update goal status');
		}
	};

	const deleteGoal = async (goalId: string) => {
		if (!confirm('Are you sure you want to delete this goal?')) return;

		try {
			const { error } = await supabase
				.from('project_goals')
				.delete()
				.eq('id', goalId);

			if (error) throw error;

			setGoals(prev => prev.filter(goal => goal.id !== goalId));
		} catch (error) {
			console.error('Error deleting goal:', error);
			alert('Failed to delete goal');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<Target className="h-8 w-8 text-blue-500 animate-spin" />
			</div>
		);
	}

	if (!user) return null;

	const filteredGoals = filter === 'all' ? goals : goals.filter(g => g.status === filter);
	const totalSavings = goals
		.filter(g => g.status === 'completed')
		.reduce((sum, g) => sum + g.potential_savings, 0);
	const potentialSavings = goals
		.filter(g => g.status !== 'completed')
		.reduce((sum, g) => sum + g.potential_savings, 0);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Sidebar
				user={user}
				currentView="projects"
				onViewChange={() => {}}
				projects={[]}
				onProjectCreated={() => {}}
				onProjectSelect={() => {}}
				selectedProjectId={null}
				isCollapsed={false}
				onToggleCollapse={() => {}}
			/>

			<div className="md:ml-72 min-h-screen p-6">
				<div className="max-w-6xl mx-auto space-y-6">
					{/* Header */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								<div>
									<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
										Goal Tracking
									</h1>
									<p className="text-gray-600 dark:text-gray-300">
										Track your cost optimization goals and progress
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-blue-600 rounded-2xl p-6 text-white">
							<div className="flex items-center justify-between mb-2">
								<Target className="h-6 w-6" />
								<TrendingUp className="h-5 w-5" />
							</div>
							<p className="text-4xl font-bold mb-1">{goals.length}</p>
							<p className="text-blue-100">Total Goals</p>
						</div>

						<div className="bg-green-600 rounded-2xl p-6 text-white">
							<div className="flex items-center justify-between mb-2">
								<DollarSign className="h-6 w-6" />
								<CheckCircle className="h-5 w-5" />
							</div>
							<p className="text-4xl font-bold mb-1">${totalSavings.toLocaleString()}</p>
							<p className="text-green-100">Realized Savings</p>
						</div>

						<div className="bg-yellow-600 rounded-2xl p-6 text-white">
							<div className="flex items-center justify-between mb-2">
								<Clock className="h-6 w-6" />
								<Target className="h-5 w-5" />
							</div>
							<p className="text-4xl font-bold mb-1">${potentialSavings.toLocaleString()}</p>
							<p className="text-yellow-100">Potential Savings</p>
						</div>
					</div>

					{/* Filters */}
					<div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 w-fit">
						{(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
							<button
								key={status}
								onClick={() => setFilter(status)}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									filter === status
										? 'bg-blue-600 text-white'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}`}
							>
								{status === 'all' ? 'All' : status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
							</button>
						))}
					</div>

					{/* Goals List */}
					{filteredGoals.length === 0 ? (
						<div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
							<Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								No goals yet
							</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								Accept suggestions from your project estimations to start tracking goals
							</p>
							<button
								onClick={() => router.push('/dashboard')}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
							>
								View Projects
							</button>
						</div>
					) : (
						<div className="space-y-4">
							{filteredGoals.map((goal) => (
								<div 
									key={goal.id}
									className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all ${
										goal.status === 'completed' ? 'border-green-500' :
										goal.status === 'in_progress' ? 'border-blue-500' :
										'border-gray-200 dark:border-gray-700'
									}`}
								>
									<button
										onClick={() => toggleGoal(goal.id)}
										className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
									>
										<div className="flex items-center space-x-4 flex-1">
											<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
												goal.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
												goal.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900' :
												'bg-gray-100 dark:bg-gray-700'
											}`}>
												{goal.status === 'completed' ? (
													<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
												) : goal.status === 'in_progress' ? (
													<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
												) : (
													<Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
												)}
											</div>

											<div className="flex-1 text-left">
												<h3 className="font-semibold text-gray-900 dark:text-white">
													{goal.title}
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{goal.project_name} • {goal.timeframe}
												</p>
											</div>

											<div className="text-right">
												<p className="text-lg font-bold text-green-600 dark:text-green-400">
													${goal.potential_savings.toLocaleString()}/mo
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													savings
												</p>
											</div>
										</div>

										{expandedGoals.includes(goal.id) ? (
											<ChevronUp className="h-5 w-5 text-gray-400 ml-4" />
										) : (
											<ChevronDown className="h-5 w-5 text-gray-400 ml-4" />
										)}
									</button>

									{expandedGoals.includes(goal.id) && (
										<div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
											<div className="space-y-4">
												<div>
													<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														Description
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{goal.description}
													</p>
												</div>

												<div>
													<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
														Implementation Steps
													</p>
													<ol className="space-y-2">
														{goal.implementation_steps.map((step, index) => (
															<li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
																<span className="text-blue-600 dark:text-blue-400 font-medium">
																	{index + 1}.
																</span>
																<span>{step}</span>
															</li>
														))}
													</ol>
												</div>

												<div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
													<div className="flex items-center space-x-2">
														{goal.status !== 'completed' && (
															<>
																{goal.status === 'pending' && (
																	<button
																		onClick={() => updateGoalStatus(goal.id, 'in_progress')}
																		className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
																	>
																		Start Working
																	</button>
																)}
																{goal.status === 'in_progress' && (
																	<button
																		onClick={() => updateGoalStatus(goal.id, 'completed')}
																		className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
																	>
																		<Check className="h-4 w-4" />
																		<span>Mark Complete</span>
																	</button>
																)}
																<button
																	onClick={() => deleteGoal(goal.id)}
																	className="border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
																>
																	<X className="h-4 w-4" />
																	<span>Delete</span>
																</button>
															</>
														)}
													</div>

													<div className="text-right">
														<p className="text-xs text-gray-500 dark:text-gray-400">
															Created {new Date(goal.created_at).toLocaleDateString()}
														</p>
														{goal.completed_at && (
															<p className="text-xs text-green-600 dark:text-green-400">
																Completed {new Date(goal.completed_at).toLocaleDateString()}
															</p>
														)}
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
