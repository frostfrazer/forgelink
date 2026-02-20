'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, Zap, Star, TrendingUp } from 'lucide-react';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState<string | null>(null);

  const handleUpgrade = async (tier: string) => {
    if (!email) {
      setShowEmailInput(tier);
      return;
    }

    setIsLoading(tier);
    try {
      const response = await fetch('/api/paystack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tier,
          serverId: 'new',
          serverName: 'My Integration',
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payment initialization failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'List your integration',
        'Basic listing page',
        'Community support',
        'Standard placement',
      ],
      cta: 'Submit Free',
      icon: Zap,
      tier: 'free',
    },
    {
      name: 'Verified',
      price: '$99',
      period: 'one-time',
      description: 'Build trust with developers',
      features: [
        'Everything in Free',
        'Verified badge',
        'Priority in search results',
        'Email support',
        'Featured in verified section',
      ],
      cta: 'Get Verified',
      icon: Check,
      tier: 'verified',
    },
    {
      name: 'Featured',
      price: '$199',
      period: 'per month',
      description: 'Maximum visibility',
      features: [
        'Everything in Verified',
        'Featured badge',
        'Top of browse page',
        'Homepage placement',
        'Analytics dashboard',
        'Priority support',
      ],
      cta: 'Go Featured',
      icon: Star,
      popular: true,
      tier: 'featured',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and organizations',
      features: [
        'Everything in Featured',
        'Multiple listings',
        'White-label options',
        'Custom integrations',
        'Dedicated support',
        'Custom contracts',
      ],
      cta: 'Contact Sales',
      icon: TrendingUp,
      tier: 'enterprise',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to showcase your AI agent integration
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-green-100 text-green-700">
              🇰🇪 M-Pesa Supported
            </Badge>
            <Badge className="bg-blue-100 text-blue-700">
              💳 Card Payments
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              🏦 Bank Transfer
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-2 text-sm">
                      /{plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {showEmailInput === plan.tier && (
                  <div className="mb-3 space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                {plan.tier === 'free' ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.location.href = '/submit'}
                  >
                    {plan.cta}
                  </Button>
                ) : plan.tier === 'enterprise' ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.location.href = 'mailto:hello@forgelink.io'}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.tier)}
                    disabled={isLoading === plan.tier}
                  >
                    {isLoading === plan.tier ? 'Loading...' : plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Revenue Projections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Conservative</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 mb-2">$2.5K/mo</p>
                <p className="text-sm text-gray-600">10 verified + 5 featured</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500 border-2">
              <CardHeader>
                <CardTitle>Realistic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 mb-2">$8K/mo</p>
                <p className="text-sm text-gray-600">30 verified + 15 featured</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Aggressive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 mb-2">$25K/mo</p>
                <p className="text-sm text-gray-600">100 verified + 50 featured</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
