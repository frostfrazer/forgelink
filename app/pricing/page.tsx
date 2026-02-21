'use client';

import { useState } from 'react';
import { Nav } from '../../components/nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Check, Zap, Star, TrendingUp, Shield, Loader2, ExternalLink } from 'lucide-react';

const plans = [
  {
    name: 'Free', price: '$0', description: 'Perfect for getting started',
    features: ['List your integration', 'Basic listing page', 'Community support', 'Standard placement'],
    cta: 'Submit Free', icon: Zap, tier: 'free',
  },
  {
    name: 'Verified', price: '$99', period: 'one-time', description: 'Build trust with developers',
    features: ['Everything in Free', 'Verified badge ✓', 'Priority in search results', 'Email support', 'Trust signals on listing'],
    cta: 'Get Verified', icon: Shield, tier: 'verified',
  },
  {
    name: 'Featured', price: '$199', period: 'per month', description: 'Maximum visibility',
    features: ['Everything in Verified', 'Featured badge ★', 'Top of browse page', 'Homepage carousel', 'Analytics dashboard', 'Priority support'],
    cta: 'Go Featured', icon: Star, tier: 'featured', popular: true,
  },
  {
    name: 'Enterprise', price: 'Custom', description: 'For teams and organizations',
    features: ['Everything in Featured', 'Multiple listings', 'White-label options', 'Custom integrations', 'Dedicated support'],
    cta: 'Contact Sales', icon: TrendingUp, tier: 'enterprise',
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [serverId, setServerId] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('serverId') ?? '';
    }
    return '';
  });
  const [serverName, setServerName] = useState('');
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [error, setError] = useState('');

  const startCheckout = async (tier: string) => {
    setError('');
    if (!activeForm || activeForm !== tier) { setActiveForm(tier); return; }
    if (!email) { setError('Please enter your email address.'); return; }
    if (!serverId.trim()) { setError('Please enter your integration ID so we know which listing to upgrade. Find it in your listing URL: /server/your-slug — use the slug as the ID, or contact support@forgelink.io if you need help.'); return; }

    setLoading(tier);
    try {
      const res = await fetch('/api/paystack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier, serverId: serverId.trim(), serverName: serverName || 'My Integration' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Payment initialization failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Get your AI integration in front of thousands of developers
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className="bg-green-100 text-green-700 border-0">🇰🇪 M-Pesa Supported</Badge>
            <Badge className="bg-blue-100 text-blue-700 border-0">💳 Card Payments</Badge>
            <Badge className="bg-purple-100 text-purple-700 border-0">🏦 Bank Transfer</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Email + server input form (shown when a paid tier is clicked) */}
        {activeForm && activeForm !== 'free' && activeForm !== 'enterprise' && (
          <div className="max-w-md mx-auto mb-10 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 text-center">
              Upgrading to <span className="text-blue-600 capitalize">{activeForm}</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Your email *</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Integration name (optional)</label>
                <Input placeholder="e.g. PostgreSQL MCP" value={serverName} onChange={e => setServerName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Integration ID <span className="text-red-500">*</span></label>
                <Input placeholder="your-integration-slug" value={serverId} onChange={e => setServerId(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">From your listing URL: forgelink-pi.vercel.app/server/<strong>your-slug</strong></p>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map(plan => (
            <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">Most Popular</Badge>
              )}
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${plan.popular ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {(plan as any).period && <span className="text-gray-500 text-sm">/{(plan as any).period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.tier === 'free' ? (
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/submit'}>
                    {plan.cta}
                  </Button>
                ) : plan.tier === 'enterprise' ? (
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = 'mailto:support@forgelink.io'}>
                    <ExternalLink className="w-4 h-4 mr-2" />{plan.cta}
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => startCheckout(plan.tier)}
                    disabled={loading === plan.tier}
                  >
                    {loading === plan.tier
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting…</>
                      : activeForm === plan.tier
                      ? `Pay ${plan.price} →`
                      : plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Common questions</h2>
          <div className="space-y-4">
            {[
              ['What payment methods are supported?', 'Card (Visa, Mastercard), M-Pesa, bank transfer, and USSD — powered by Paystack.'],
              ['When does my badge activate?', 'Instantly after payment confirmation. Your listing updates within seconds.'],
              ['Can I upgrade an existing listing?', 'Yes — enter your integration ID (from the listing URL) in the checkout form.'],
              ['Is Featured monthly?', 'Yes, Featured is $199/month. Verified is a one-time $99 payment.'],
              ['What if I need a refund?', 'Contact support@forgelink.io within 7 days of purchase.'],
            ].map(([q, a]) => (
              <details key={q} className="bg-white border border-gray-200 rounded-xl px-5 py-4 group">
                <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg">↓</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
