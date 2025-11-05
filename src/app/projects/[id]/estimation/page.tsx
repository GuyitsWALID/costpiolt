"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Project, ProjectEstimation } from '@/lib/supabaseClient';
import { 
	Calculator, 
	Brain, 
	TrendingUp, 
	AlertCircle, 
	CheckCircle, 
	Lightbulb,
	ArrowRight,
	DollarSign,
	Clock,
	Users,
	Server,
	Database,
	Zap,
	Check,
	ChevronDown,
	ChevronUp
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import type { User } from '@supabase/supabase-js';

interface ThoughtStep {
	step: number;
	title: string;
	reasoning: string;
	conclusion: string;
	impact: 'low' | 'medium' | 'high';
}

interface CostBreakdown {
	category: string;
	amount: number;
	percentage: number;
	reasoning: string;
	icon: any;
}

interface Suggestion {
	id: string;
	title: string;
	description: string;
	potentialSavings: number;
	difficulty: 'easy' | 'medium' | 'hard';
	timeframe: string;
	implementation: string[];
	accepted: boolean;
}

export default function EstimationPage() {
	const params = useParams();
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [project, setProject] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);
	const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);

	// Mock AI thought process
	const thoughtProcess: ThoughtStep[] = [
		{
			step: 1,
			title: "Analyzing Project Scope",
			reasoning: "Based on the project type and model approach, I'm evaluating the computational requirements and infrastructure needs.",
			conclusion: "This project requires GPU compute resources with moderate storage needs.",
			impact: 'high'
		},
		{
			step: 2,
			title: "Calculating Infrastructure Costs",
			reasoning: "Considering GPU type, training hours, and deployment architecture to estimate compute costs.",
			conclusion: "Estimated monthly compute cost of $3,200 based on A100 usage patterns.",
			impact: 'high'
		},
		{
			step: 3,
			title: "Evaluating Data Requirements",
			reasoning: "Dataset size and storage type determine data costs. Analyzing redundancy needs and retention policies.",
			conclusion: "Data storage and transfer costs estimated at $450/month.",
			impact: 'medium'
		},
		{
			step: 4,
			title: "Team Cost Analysis",
			reasoning: "Personnel costs represent 60-80% of total project costs. Analyzing team composition and salaries.",
			conclusion: "Monthly team costs: $25,000 for the proposed team structure.",
			impact: 'high'
		},
		{
			step: 5,
			title: "Compliance & Security Overhead",
			reasoning: "Selected compliance frameworks require additional infrastructure and monitoring.",
			conclusion: "Compliance-related costs add $1,200/month for GDPR and SOC 2.",
			impact: 'medium'
		},
		{
			step: 6,
			title: "Risk Buffer Application",
			reasoning: "Applied 25% contingency buffer for AI/ML project uncertainties.",
			conclusion: "Final estimate includes buffer for experimentation and iterations.",
			impact: 'medium'
		}
	];

	// Mock cost breakdown
	const costBreakdown: CostBreakdown[] = [
		{ category: 'Team & Personnel', amount: 25000, percentage: 62, reasoning: 'Salaries for ML engineers and DevOps team', icon: Users },
		{ category: 'Compute & GPUs', amount: 3200, percentage: 8, reasoning: 'GPU training and inference costs', icon: Zap },
		{ category: 'Infrastructure', amount: 1800, percentage: 4.5, reasoning: 'Cloud hosting, networking, load balancing', icon: Server },
		{ category: 'Data Storage', amount: 450, percentage: 1.1, reasoning: 'Object storage, databases, backups', icon: Database },
		{ category: 'Monitoring & Tools', amount: 800, percentage: 2, reasoning: 'Observability stack, experiment tracking', icon: TrendingUp },
		{ category: 'Compliance', amount: 1200, percentage: 3, reasoning: 'GDPR, SOC 2 compliance infrastructure', icon: AlertCircle },
		{ category: 'Contingency Buffer', amount: 7750, percentage: 19.4, reasoning: '25% buffer for uncertainties', icon: DollarSign }
	];

	// Mock suggestions
	const initialSuggestions: Suggestion[] = [
		{
			id: 'sug-1',
			title: 'Use Spot Instances for Training',
			description: 'Switch to spot instances for non-critical training runs to reduce GPU costs by up to 70%.',
			potentialSavings: 2240,
			difficulty: 'easy',
			timeframe: '1-2 weeks',
			implementation: [
				'Configure spot instance auto-bidding',
				'Implement checkpoint system for training interruptions',
				'Set up automatic instance recovery'
			],
			accepted: false
		},
		{
			id: 'sug-2',
			title: 'Implement Data Compression',
			description: 'Compress training data and model checkpoints to reduce storage costs by 40-60%.',
			potentialSavings: 225,
			difficulty: 'medium',
			timeframe: '2-3 weeks',
			implementation: [
				'Evaluate compression algorithms',
				'Update data pipeline to handle compressed data',
				'Test model performance with compressed inputs'
			],
			accepted: false
		},
		{
			id: 'sug-3',
			title: 'Optimize Team Structure',
			description: 'Start with a smaller core team and scale as needed. Consider 1 senior + 1 mid-level initially.',
			potentialSavings: 12500,
			difficulty: 'hard',
			timeframe: 'Immediate',
			implementation: [
				'Prioritize critical roles for initial phase',
				'Use contractors for specialized tasks',
				'Plan hiring roadmap based on milestones'
			],
			accepted: false
		},
		{
			id: 'sug-4',
			title: 'Use Open-Source Tools',
			description: 'Replace premium experiment tracking with MLflow and use open-source monitoring tools.',
			potentialSavings: 400,
			difficulty: 'easy',
			timeframe: '1 week',
			implementation: [
				'Set up MLflow on existing infrastructure',
				'Migrate experiment history',
				'Configure Prometheus + Grafana for monitoring'
			],
			accepted: false
		}
	];

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession();
				if (!session?.user) {
					router.push('/auth');
					return;
				}
				setUser(session.user);

				// Check if params and params.id exist
				if (!params?.id) {
					router.push('/dashboard');
					return;
				}

				// Fetch project
				const { data: projectData, error } = await supabase
					.from('projects')
					.select('*')
					.eq('id', params.id)
					.eq('user_id', session.user.id)
					.single();

				if (error || !projectData) {
					console.error('Project not found:', error);
					router.push('/dashboard');
					return;
				}

				setProject(projectData);
				setSuggestions(initialSuggestions);
			} catch (error) {
				console.error('Error:', error);
				router.push('/auth');
			} finally {
				setLoading(false);
			}
		};

		initializeAuth();
	}, [params?.id, router]);

	const toggleStep = (step: number) => {
		setExpandedSteps(prev => 
			prev.includes(step) 
				? prev.filter(s => s !== step)
				: [...prev, step]
		);
	};

	const handleAcceptSuggestion = async (suggestionId: string) => {
		const suggestion = suggestions.find(s => s.id === suggestionId);
		if (!suggestion || !project) return;

		try {
			// Create goal in database
			const { error } = await supabase
				.from('project_goals')
				.insert({
					project_id: project.id,
					user_id: user?.id,
					title: suggestion.title,
					description: suggestion.description,
					potential_savings: suggestion.potentialSavings,
					difficulty: suggestion.difficulty,
					timeframe: suggestion.timeframe,
					implementation_steps: suggestion.implementation,
					status: 'pending',
					created_at: new Date().toISOString()
				});

			if (error) throw error;

			// Update local state
			setAcceptedSuggestions(prev => [...prev, suggestionId]);
			setSuggestions(prev => 
				prev.map(s => s.id === suggestionId ? { ...s, accepted: true } : s)
			);

			alert('✅ Goal added to your Goal Tracking page!');
		} catch (error) {
			console.error('Error creating goal:', error);
			alert('Failed to add goal. Please try again.');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<Calculator className="h-8 w-8 text-blue-500 animate-spin" />
			</div>
		);
	}

	if (!user || !project) return null;

	const totalCost = costBreakdown.reduce((sum, item) => sum + item.amount, 0);
	const totalSavings = suggestions
		.filter(s => acceptedSuggestions.includes(s.id))
		.reduce((sum, s) => sum + s.potentialSavings, 0);

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

			<div className="md:ml-72 min-h-screen">
				<div className="max-w-7xl mx-auto p-6 space-y-8">
					{/* Header */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
						<div className="flex items-start justify-between">
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
									{project.name}
								</h1>
								<p className="text-gray-600 dark:text-gray-300">
									AI-Powered Budget Estimation & Analysis
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm text-gray-500 dark:text-gray-400">Total Estimated Cost</p>
								<p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
									${totalCost.toLocaleString()}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
							</div>
						</div>
					</div>

					{/* AI Thought Process */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
						<div className="flex items-center space-x-3 mb-6">
							<Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								AI Analysis Process
							</h2>
						</div>

						<div className="space-y-4">
							{thoughtProcess.map((step) => (
								<div 
									key={step.step}
									className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
								>
									<button
										onClick={() => toggleStep(step.step)}
										className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									>
										<div className="flex items-center space-x-4">
											<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
												step.impact === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' :
												step.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' :
												'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
											}`}>
												{step.step}
											</div>
											<div className="text-left">
												<h3 className="font-semibold text-gray-900 dark:text-white">
													{step.title}
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{step.conclusion}
												</p>
											</div>
										</div>
										{expandedSteps.includes(step.step) ? (
											<ChevronUp className="h-5 w-5 text-gray-400" />
										) : (
											<ChevronDown className="h-5 w-5 text-gray-400" />
										)}
									</button>

									{expandedSteps.includes(step.step) && (
										<div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
											<div className="space-y-3">
												<div>
													<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														Reasoning:
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{step.reasoning}
													</p>
												</div>
												<div>
													<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														Conclusion:
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{step.conclusion}
													</p>
												</div>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Cost Breakdown */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
						<div className="flex items-center space-x-3 mb-6">
							<DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
								Detailed Cost Breakdown
							</h2>
						</div>

						<div className="space-y-4">
							{costBreakdown.map((item, index) => {
								const Icon = item.icon;
								return (
									<div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
										<div className="flex items-start justify-between mb-2">
											<div className="flex items-center space-x-3">
												<Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
												<div>
													<h3 className="font-semibold text-gray-900 dark:text-white">
														{item.category}
													</h3>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														{item.reasoning}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-gray-900 dark:text-white">
													${item.amount.toLocaleString()}
												</p>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{item.percentage}%
												</p>
											</div>
										</div>
										
										{/* Progress bar */}
										<div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
											<div 
												className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
												style={{ width: `${item.percentage}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Optimization Suggestions */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center space-x-3">
								<Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
									Cost Optimization Suggestions
								</h2>
							</div>
							{totalSavings > 0 && (
								<div className="text-right">
									<p className="text-sm text-gray-500 dark:text-gray-400">Potential Savings</p>
									<p className="text-2xl font-bold text-green-600 dark:text-green-400">
										${totalSavings.toLocaleString()}/mo
									</p>
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{suggestions.map((suggestion) => (
								<div 
									key={suggestion.id}
									className={`border rounded-lg p-5 transition-all ${
										acceptedSuggestions.includes(suggestion.id)
											? 'border-green-500 bg-green-50 dark:bg-green-900/20'
											: 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
									}`}
								>
									<div className="flex items-start justify-between mb-3">
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
												{suggestion.title}
											</h3>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
												{suggestion.description}
											</p>
										</div>
										{acceptedSuggestions.includes(suggestion.id) && (
											<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 ml-2" />
										)}
									</div>

									<div className="space-y-2 mb-4">
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-500 dark:text-gray-400">Potential Savings:</span>
											<span className="font-semibold text-green-600 dark:text-green-400">
												${suggestion.potentialSavings.toLocaleString()}/mo
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${
												suggestion.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
												suggestion.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
												'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
											}`}>
												{suggestion.difficulty}
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-500 dark:text-gray-400">Timeframe:</span>
											<span className="text-gray-900 dark:text-white font-medium">
												{suggestion.timeframe}
											</span>
										</div>
									</div>

									{acceptedSuggestions.includes(suggestion.id) ? (
										<button
											disabled
											className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 opacity-75 cursor-not-allowed"
										>
											<Check className="h-4 w-4" />
											<span>Added to Goals</span>
										</button>
									) : (
										<button
											onClick={() => handleAcceptSuggestion(suggestion.id)}
											className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
										>
											<span>Accept & Track</span>
											<ArrowRight className="h-4 w-4" />
										</button>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}