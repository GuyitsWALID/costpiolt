"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Settings, 
  User, 
  CreditCard,
  Bell, 
  Shield, 
  Save,
  Edit,
  Check,
  X,
  Crown
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { ThemeToggle } from './theme-toggle';
import { loadStripe } from '@stripe/stripe-js';

interface UserProfile {
  full_name: string;
  company?: string;
  phone?: string;
  bio?: string;
}

interface UserSubscription {
  id: string;
  plan_name: string;
  plan_price: number;
  status: string;
  current_period_start: string;
  current_period_end: string;
  polar_subscription_id: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  productId: string;
  current: boolean;
}

interface SettingsProps {
  user: SupabaseUser;
}

export default function SettingsPage({ user }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'notifications' | 'security'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    full_name: user.user_metadata?.full_name || '',
    company: user.user_metadata?.company || '',
    phone: user.user_metadata?.phone || '',
    bio: user.user_metadata?.bio || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email_updates: true,
    project_alerts: true,
    budget_reminders: true,
    marketing: false
  });
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'success' | 'canceled' | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  // Updated subscription plans with your actual Stripe Price IDs
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: ['1 Project', 'Basic Budget Tracking', 'Email Support'], // Changed from '3 Projects' to '1 Project'
      productId: '', // No product ID for free plan
      current: !userSubscription || userSubscription.status !== 'active'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19,
      interval: 'month',
      features: ['Unlimited Projects', 'Advanced Analytics', 'Priority Support', 'Export Data'],
      productId: 'price_1SQ3aBIPj9aniqVHab8m4DZ8', // Pro price ID
      current: userSubscription?.plan_name === 'Pro' && userSubscription.status === 'active'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49,
      interval: 'month',
      features: ['Everything in Pro', 'Team Collaboration', 'Custom Integrations', 'Dedicated Support'],
      productId: 'price_1SQ3dBIPj9aniqVHBrhp0ZVf', // Enterprise price ID
      current: userSubscription?.plan_name === 'Enterprise' && userSubscription.status === 'active'
    }
  ];

  // Fetch user profile and subscription data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the latest user data from Supabase
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (currentUser) {
          setUserProfile({
            full_name: currentUser.user_metadata?.full_name || '',
            company: currentUser.user_metadata?.company || '',
            phone: currentUser.user_metadata?.phone || '',
            bio: currentUser.user_metadata?.bio || ''
          });
        }

        // Fetch user subscription with better error handling
        const { data: subscription, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no subscription exists

        if (subError) {
          console.log('No active subscription found or error:', subError.message);
        } else if (subscription) {
          console.log('Found active subscription:', subscription);
          setUserSubscription(subscription);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.id]);

  // Check for checkout status in URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true') {
        setCheckoutStatus('success');
        // Refresh subscription data
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else if (params.get('canceled') === 'true') {
        setCheckoutStatus('canceled');
        // Clear URL params after showing message
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('success');
          url.searchParams.delete('canceled');
          url.searchParams.delete('plan');
          window.history.replaceState({}, '', url.toString());
          setCheckoutStatus(null);
        }, 5000);
      }
    }
  }, []);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userProfile.full_name,
          company: userProfile.company,
          phone: userProfile.phone,
          bio: userProfile.bio
        }
      });

      if (error) throw error;
      
      setIsEditingProfile(false);
      // You might want to show a success toast here
    } catch (error) {
      console.error('Error updating profile:', error);
      // You might want to show an error toast here
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    
    // In a real app, you would save this to your database
    console.log('Notification settings updated:', { [key]: value });
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      
      // Show success message
      alert('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Error sending password reset:', error);
      alert('Error sending password reset email. Please try again.');
    }
  };

  const handleStripeCheckout = async (priceId: string, planName: string) => {
    if (!priceId) return;
    
    setSubscribing(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planName,
          userId: user.id,
          userEmail: user.email,
        }),
      });

        const { sessionId, url } = await response.json();
        
        // Redirect to the checkout URL
        if (url) {
          window.location.href = url;
        } else if (sessionId) {
          // Fallback: construct URL manually if only sessionId is provided
          console.error('No checkout URL provided, only session ID');
          alert('Failed to start checkout. Please try again.');
        }
      } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-4  mt-12 pl-5">
            <div className="flex items-center space-x-3 ">
              <Settings className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-sm pl-5 md:text-base text-gray-600 dark:text-gray-300 i">Manage your account settings and preferences</p>
        </div>

        {/* Checkout Status Messages - Same as before but responsive */}
        {checkoutStatus === 'success' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Subscription Successful!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Thank you for subscribing! Your account will be updated shortly. This page will refresh automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {checkoutStatus === 'canceled' && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <X className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Checkout Canceled
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  No worries! You can upgrade anytime. Your current plan remains active.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300 text-sm md:text-base">Loading settings...</span>
          </div>
        ) : (
          <>
            {/* Tabs - Mobile responsive with scrolling */}
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto pb-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'profile' | 'subscription' | 'notifications' | 'security')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {activeTab === 'profile' && (
                <div className="p-4 md:p-6">
                  <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-full md:w-auto"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Avatar and Email */}
                    <div className="flex flex-col items-center space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{userProfile.full_name || 'User'}</h3>
                        <p className="text-gray-600 dark:text-gray-300 break-all md:break-normal">{user.email}</p>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={userProfile.full_name}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                          disabled={!isEditingProfile}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                        <input
                          type="text"
                          value={userProfile.company}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, company: e.target.value }))}
                          disabled={!isEditingProfile}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditingProfile}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 break-all md:break-normal"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                        <textarea
                          value={userProfile.bio}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                          disabled={!isEditingProfile}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditingProfile && (
                      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-3">
                        <button
                          onClick={handleProfileSave}
                          disabled={saving}
                          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors w-full md:w-auto"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full md:w-auto"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-6">Subscription & Billing</h2>

                  {/* Current Plan */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">Current Plan</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div className="flex items-start space-x-3">
                          <Crown className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm md:text-base">
                              {subscriptionPlans.find(plan => plan.current)?.name || 'No Active Subscription'} Plan
                            </h4>
                            <p className="text-blue-700 dark:text-blue-300 text-sm">
                              ${subscriptionPlans.find(plan => plan.current)?.price || 0}/{subscriptionPlans.find(plan => plan.current)?.interval} • 
                              {subscriptionPlans.find(plan => plan.current)?.features.length} features
                            </p>
                            {userSubscription && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Status: {userSubscription.status}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          {userSubscription ? (
                            <>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Next billing date</p>
                              <p className="font-medium text-blue-900 dark:text-blue-100 text-sm md:text-base">
                                {new Date(userSubscription.current_period_end).toLocaleDateString()}
                              </p>
                              <button
                                onClick={handleManageSubscription}
                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                              >
                                Manage Subscription
                              </button>
                            </>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">Subscribe to access projects</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Plans */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">Available Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {subscriptionPlans.filter(plan => plan.price > 0).map((plan) => (
                        <div
                          key={plan.id}
                          className={`border rounded-lg p-4 md:p-6 relative transition-all hover:shadow-lg ${
                            plan.current 
                              ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          {plan.current && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                Current Plan
                              </span>
                            </div>
                          )}
                          
                          <div className="text-center mb-4">
                            <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                            <div className="mt-2">
                              <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                              <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">/{plan.interval}</span>
                            </div>
                          </div>

                          <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={() => handleStripeCheckout(plan.productId, plan.name)}
                            disabled={plan.current || subscribing}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                              plan.current
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {subscribing ? 'Processing...' : plan.current ? 'Current Plan' : `Subscribe to ${plan.name}`}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">Billing Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            All payments are processed securely through Stripe
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            You can cancel or modify your subscription at any time
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs remain similar with responsive adjustments */}
              {activeTab === 'notifications' && (
                <div className="p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    {Object.entries({
                      email_updates: {
                        title: 'Email Updates',
                        description: 'Receive email notifications about your account activity'
                      },
                      project_alerts: {
                        title: 'Project Alerts',
                        description: 'Get notified when projects exceed budget thresholds'
                      },
                      budget_reminders: {
                        title: 'Budget Reminders',
                        description: 'Weekly reminders to update your budget tracking'
                      },
                      marketing: {
                        title: 'Marketing Communications',
                        description: 'Receive updates about new features and promotions'
                      }
                    }).map(([key, config]) => (
                      <div key={key} className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">{config.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{config.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[key as keyof typeof notifications]}
                            onChange={(e) => handleNotificationUpdate(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>

                  <div className="space-y-6 md:space-y-8">
                    {/* Password Section */}
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">Password</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Password</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: Never</p>
                          </div>
                          <button
                            onClick={handlePasswordReset}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full md:w-auto"
                          >
                            Reset Password
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
                      <div className="space-y-3">
                        <div className="flex flex-col space-y-1 md:flex-row md:justify-between md:space-y-0 py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Account created</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1 md:flex-row md:justify-between md:space-y-0 py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Last sign in</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1 md:flex-row md:justify-between md:space-y-0 py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Email verified</span>
                          <span className={`text-sm font-medium ${user.email_confirmed_at ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {user.email_confirmed_at ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                      <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                          <div>
                            <p className="text-sm font-medium text-red-900 dark:text-red-100">Delete Account</p>
                            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                              Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                          </div>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full md:w-auto"
                            onClick={() => alert('Account deletion would be implemented here')}
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}