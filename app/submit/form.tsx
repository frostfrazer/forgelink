'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export function SubmitForm({ earlyBirdLeft }: { earlyBirdLeft: number }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', tagline: '', description: '',
    category: 'Database', protocol: 'MCP',
    githubUrl: '', npmPackage: '', installCommand: '',
    authorName: '', authorEmail: '',
    preferredTier: earlyBirdLeft > 0 ? 'early-bird' : 'verified',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/submit/success');
      } else {
        setError(data.message ?? 'Failed to submit. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
          <CardDescription>Choose your submission tier</CardDescription>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className={`border-2 rounded-lg p-4 bg-white ${earlyBirdLeft > 0 ? 'border-green-500' : 'border-gray-200 opacity-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Early Bird FREE</h3>
                {earlyBirdLeft > 0
                  ? <Badge className="bg-green-500">{earlyBirdLeft} left</Badge>
                  : <Badge variant="secondary">Sold out</Badge>}
              </div>
              <p className="text-2xl font-bold mb-2">$0</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ Verified badge included</li>
                <li>✓ Live within 24 hours</li>
                <li>✓ First {10} submissions only</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Verified</h3>
              <p className="text-2xl font-bold mb-2">$99 <span className="text-sm font-normal text-gray-600">one-time</span></p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ Verified badge</li>
                <li>✓ Priority placement</li>
                <li>✓ Live within 24 hours</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-semibold mb-1">How it works:</p>
            <p className="text-gray-700">1. Submit your integration details below<br/>2. We'll review and contact you within 24hrs<br/>3. Choose your tier and we'll activate your listing</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div><Label htmlFor="name">Integration Name *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="PostgreSQL MCP Server" required /></div>

          <div><Label htmlFor="tagline">Tagline *</Label>
            <Input id="tagline" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Connect AI agents to PostgreSQL databases" required />
            <p className="text-xs text-gray-500 mt-1">A short, catchy description (60 characters max)</p></div>

          <div><Label htmlFor="description">Description *</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Full-featured PostgreSQL connector for AI agents..." rows={4} required /></div>

          <div><Label htmlFor="protocol">Protocol / Platform *</Label>
            <select id="protocol" name="protocol" value={formData.protocol} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
              <option value="MCP">MCP (Model Context Protocol)</option>
              <option value="OpenAI">OpenAI GPT Actions</option>
              <option value="LangChain">LangChain Tools</option>
              <option value="AutoGPT">AutoGPT Plugins</option>
              <option value="Custom API">Custom API Integration</option>
            </select></div>

          <div><Label htmlFor="category">Category *</Label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
              {['Database','Communication','Development','Finance','Cloud','Analytics','AI & ML','Productivity'].map(c => <option key={c} value={c}>{c}</option>)}
            </select></div>

          <div><Label htmlFor="githubUrl">GitHub URL</Label>
            <Input id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/username/repo" type="url" /></div>

          <div><Label htmlFor="npmPackage">NPM / PyPI Package</Label>
            <Input id="npmPackage" name="npmPackage" value={formData.npmPackage} onChange={handleChange} placeholder="@mcp/postgresql or langchain-community" /></div>

          <div><Label htmlFor="installCommand">Install Command *</Label>
            <Input id="installCommand" name="installCommand" value={formData.installCommand} onChange={handleChange} placeholder="npm install @mcp/postgresql" required /></div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Your Information</h3>
            <div><Label htmlFor="authorName">Your Name *</Label>
              <Input id="authorName" name="authorName" value={formData.authorName} onChange={handleChange} placeholder="John Doe" required /></div>
            <div><Label htmlFor="authorEmail">Your Email *</Label>
              <Input id="authorEmail" name="authorEmail" value={formData.authorEmail} onChange={handleChange} placeholder="john@example.com" type="email" required /></div>
            <div><Label htmlFor="preferredTier">Preferred Tier *</Label>
              <select id="preferredTier" name="preferredTier" value={formData.preferredTier} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                {earlyBirdLeft > 0 && <option value="early-bird">🎉 Early Bird FREE ({earlyBirdLeft} left)</option>}
                <option value="verified">⭐ Verified — $99 (pay after approval)</option>
                <option value="free-review">⏳ Free Review (7–14 days, no badge)</option>
              </select></div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Integration'}
          </Button>
          <p className="text-xs text-gray-500 text-center">By submitting, you agree that your integration is safe and functional.</p>
        </CardContent>
      </Card>
    </form>
  );
}
