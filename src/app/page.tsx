import { ArrowRight, Zap, Target, BarChart3, CheckCircle2, Star, Rocket, Brain, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 20 + 's',
              animationDuration: (Math.random() * 20 + 10) + 's'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">CostPilot</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="/budget" className="text-slate-300 hover:text-white transition-colors">Budget Tool</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="/budget" className="btn-cyber bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all no-underline">
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <Rocket className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">AI Budget Forecaster</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Fast, Accurate
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> AI Budget </span>
            Forecasts
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Get cost estimates for training, fine-tuning, inference, and team costs in under 3 minutes. 
            Built for AI project managers and technical leaders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/budget" className="btn-cyber bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 transition-all animate-border no-underline">
              <Zap className="h-5 w-5" />
              <span>Start Quick Estimate</span>
              <ArrowRight className="h-5 w-5" />
            </a>
            <button className="glass border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-400">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Enterprise Grade</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>99% Accuracy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Trusted by 1000+ Teams</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for 
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"> AI Cost Planning</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Comprehensive tools and insights to plan, budget, and optimize your AI projects from concept to deployment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Quick Estimate */}
            <div className="glass-dark p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Quick Estimate</h3>
              <p className="text-slate-300 mb-6">
                Get instant cost estimates for training, fine-tuning, and inference. Just input your model specs and get results in seconds.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>GPU cost calculation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Cloud provider comparison</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Real-time pricing</span>
                </li>
              </ul>
            </div>

            {/* Budget Editor */}
            <div className="glass-dark p-8 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Budget Editor</h3>
              <p className="text-slate-300 mb-6">
                Create detailed budgets with custom parameters. Adjust team sizes, timelines, and resource allocation.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Team cost calculator</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Timeline planning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Resource optimization</span>
                </li>
              </ul>
            </div>

            {/* Scenario Planning */}
            <div className="glass-dark p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Scenario Planning</h3>
              <p className="text-slate-300 mb-6">
                Compare different approaches and optimize your strategy. Model various scenarios to find the best path forward.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>What-if analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Risk assessment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>ROI projections</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-dark p-12 rounded-3xl border border-blue-500/20">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Optimize Your AI Budget?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of teams using CostPilot to make smarter AI investment decisions.
            </p>
            <button className="btn-cyber bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 mx-auto transition-all">
              <Rocket className="h-5 w-5" />
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Brain className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">CostPilot</span>
          </div>
          <p className="text-slate-400 mb-6">
            AI Budget Forecaster - Fast, accurate budget forecasts for AI projects.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
