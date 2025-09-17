"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Calculator, 
  Shield, 
  Zap, 
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Target,
  Rocket
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [particles, setParticles] = useState<Array<{
    left: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);


  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    const generatedParticles = Array.from({ length: 50 }, () => ({
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 20 + 's',
      animationDuration: (Math.random() * 20 + 10) + 's'
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 light:from-blue-50 light:via-white light:to-blue-50 relative overflow-hidden">
      {/* Simple Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical Lines */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-2/4 top-0 bottom-0 w-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        
        {/* Horizontal Lines */}
        <div className="absolute left-0 right-0 top-1/4 h-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-0 right-0 top-2/4 h-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-0 right-0 top-3/4 h-px bg-blue-600/20 dark:bg-blue-400/20"></div>
      </div>

      {/* Floating Particles Background */}
      <div className="floating-particles">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: particle.left,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-2 left-4 right-4 z-50 bg-background/80 backdrop-blur-md border-2 border-dashed border-blue-500/60 dark:border-blue-400/60 rounded-3xl p-4 md:p-6 mx-auto max-w-7xl">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            <span className="text-xl md:text-3xl font-array font-bold text-foreground">CostPilot</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-blue-500 font-khand font-semibold hover:text-foreground transition-colors">Features</a>
            <a href="/budget" className="text-blue-500 font-khand font-semibold hover:text-foreground transition-colors">Budget Tool</a>
            <a href="#pricing" className="text-blue-500 font-khand font-semibold hover:text-foreground transition-colors">Pricing</a>
            <ThemeToggle />
            <Button
              className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white transition-all duration-200 transform hover:scale-105 focus:scale-105 font-khand"
              asChild
              variant="default"
              size="default"
            >
              <Link href="/auth">
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
          </div>
        </nav>

      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-20 pt-28 md:pt-36">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/90 border border-blue-500/20 rounded-full px-3 md:px-4 py-2 mb-6 md:mb-8">
            <Rocket className="h-3 w-3 md:h-4 md:w-4 text-white" />
            <span className="text-white text-xs md:text-sm font-khand font-medium">AI Budget Forecaster</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-array font-bold text-foreground mb-4 md:mb-6 leading-tight">
            Fast, Accurate
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> AI Budget </span>
            Forecasts
          </h1>
          
          <p className="text-lg md:text-xl font-khand text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            Get cost estimates for training, fine-tuning, inference, and team costs in under 3 minutes. 
            Built for AI project managers and technical leaders.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <Button
              asChild
              size="lg" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-khand font-semibold transition-all transform hover:scale-105 focus:scale-105"
            >
              <Link href="/auth" className="flex items-center justify-center space-x-2 no-underline">
                <Zap className="h-4 w-4 md:h-5 md:w-5" />
                <span>Start Quick Estimate</span>
              <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-600 text-foreground hover:bg-muted dark:border-white dark:text-foreground dark:hover:bg-white/10 px-8 py-4 text-lg font-khand font-semibold transition-all"
            >
              Watch Demo
            </Button>
            </div>

          {/* Trust Indicators */}
          <div className="mt-12 md:mt-16 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-muted-foreground px-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
              <span className="text-sm md:text-base font-khand">Enterprise Grade</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
              <span className="text-sm md:text-base font-khand">99% Accuracy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
              <span className="text-sm md:text-base font-khand">Trusted by 1000+ Teams</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-array font-bold text-foreground mb-4 md:mb-6 px-4">
              Everything You Need for 
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"> AI Cost Planning</span>
            </h2>
            <p className="text-lg md:text-xl font-khand text-muted-foreground max-w-2xl mx-auto px-4">
              Comprehensive tools and insights to plan, budget, and optimize your AI projects from concept to deployment.
            </p>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
            {/* Quick Estimate */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 border border-border p-6 md:p-8 rounded-2xl hover:border-blue-400/40 transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 md:mb-6">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
              </div>
              <h3 className="text-lg md:text-xl font-array font-semibold text-card-foreground mb-3 md:mb-4">Quick Estimate</h3>
              <p className="font-khand text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
              Get instant cost estimates for training, fine-tuning, and inference. Just input your model specs and get results in seconds.
              </p>
              <ul className="space-y-2 text-sm font-khand text-muted-foreground">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>GPU cost calculation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Cloud provider comparison</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Real-time pricing</span>
              </li>
              </ul>
            </div>

            {/* Budget Editor */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 border border-border p-8 rounded-2xl hover:border-purple-400/40 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-array font-semibold text-card-foreground mb-4">Budget Editor</h3>
              <p className="font-khand text-muted-foreground mb-6">
              Create detailed budgets with custom parameters. Adjust team sizes, timelines, and resource allocation.
              </p>
              <ul className="space-y-2 text-sm font-khand text-muted-foreground">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Team cost calculator</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Timeline planning</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Resource optimization</span>
              </li>
              </ul>
            </div>

            {/* Scenario Planning */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 border border-border p-8 rounded-2xl hover:border-cyan-400/40 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-array font-semibold text-card-foreground mb-4">Scenario Planning</h3>
              <p className="font-khand text-muted-foreground mb-6">
              Compare different approaches and optimize your strategy. Model various scenarios to find the best path forward.
              </p>
              <ul className="space-y-2 text-sm font-khand text-muted-foreground">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>What-if analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Risk assessment</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>ROI projections</span>
              </li>
              </ul>
            </div>
            </div>
          </div>
          </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-block border-2 border-dashed border-black dark:border-white rounded-full px-6 py-3 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-array font-bold text-foreground">
                  Simple, Transparent Pricing
                </h2>
              </div>
            </div>
          <div className="text-center mb-12 md:mb-16">
            <p className="text-lg md:text-xl font-khand text-muted-foreground max-w-2xl mx-auto px-4">
              Choose the plan that fits your team&apos;s needs. All plans include our core AI-powered budget forecasting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
            {/* Starter Plan */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 border border-border p-6 md:p-8 rounded-2xl hover:border-blue-500/50 transition-all">
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-array font-semibold text-card-foreground mb-2">Starter</h3>
                <div className="mb-6">
                  <span className="text-4xl font-array font-bold text-card-foreground">$0</span>
                  <span className="font-khand text-muted-foreground">/month</span>
                </div>
                <Button variant="outline" className="w-full mb-8 font-khand">
                  Get Started Free
                </Button>
              </div>
              <ul className="space-y-3 text-sm font-khand">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Up to 3 projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Basic budget estimates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Community support</span>
                </li>
              </ul>
            </div>

            {/* Professional Plan */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 border-2 border-blue-500 p-8 rounded-2xl relative hover:border-blue-400 transition-all transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-khand font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-array font-semibold text-card-foreground mb-2">Professional</h3>
                <div className="mb-6">
                  <span className="text-4xl font-array font-bold text-card-foreground">$29</span>
                  <span className="font-khand text-muted-foreground">/month</span>
                </div>
                <Button className="w-full mb-8 font-khand">
                  Start Free Trial
                </Button>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Unlimited projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Advanced AI forecasting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Team collaboration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Custom integrations</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 border border-border p-8 rounded-2xl hover:border-purple-500/50 transition-all">
              <div className="text-center">
                <h3 className="text-xl font-array font-semibold text-card-foreground mb-2">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-array font-bold text-card-foreground">Custom</span>
                </div>
                <Button variant="outline" className="w-full mb-8 font-khand">
                  Contact Sales
                </Button>
              </div>
              <ul className="space-y-3 text-sm font-khand">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Everything in Professional</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">On-premise deployment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Custom AI models</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">Dedicated support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">SLA guarantee</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 border border-border p-6 md:p-12 rounded-2xl md:rounded-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-array font-bold text-card-foreground mb-4 md:mb-6">
          Ready to Optimize Your AI Budget?
        </h2>
        <p className="text-lg md:text-xl font-khand text-muted-foreground mb-6 md:mb-8">
          Join thousands of teams using CostPilot to make smarter AI investment decisions.
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-khand">
          <Link href="/auth" className="flex items-center justify-center space-x-2">
            <Rocket className="h-4 w-4 md:h-5 md:w-5" />
            <span>Start Free Trial</span>
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 md:px-6 py-8 md:py-12 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 md:mb-6">
            <Calculator className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
            <span className="text-lg md:text-xl font-array font-bold text-foreground">CostPilot</span>
          </div>
          <p className="font-khand text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
            AI Budget Forecaster - Fast, accurate budget forecasts for AI projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-khand text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
