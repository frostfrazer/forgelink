import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, Cloud, MessageSquare, TrendingUp, Search, Rocket } from 'lucide-react';

export default function Home() {
  const categories = [
    { icon: Database, name: 'Database', count: 145, color: 'bg-blue-100 text-blue-700' },
    { icon: Cloud, name: 'Cloud Services', count: 98, color: 'bg-purple-100 text-purple-700' },
    { icon: MessageSquare, name: 'Communication', count: 67, color: 'bg-green-100 text-green-700' },
    { icon: TrendingUp, name: 'Analytics', count: 52, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ForgeLink</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/browse" className="text-sm font-medium hover:text-blue-600">
                Browse
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/submit" className="text-sm font-medium hover:text-blue-600">
                Submit
              </Link>
              <Link href="/auth/signin">
                <Button size="sm" variant="outline">Sign In</Button>
              </Link>
              <Link href="/submit">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Submit Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              🔥 Now supporting MCP, OpenAI, LangChain & more
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              AI Agent Integration
              <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover and share integrations for GPT, Claude, AutoGPT, and LangChain. Connect AI agents to any API, database, or tool.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/browse">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Integrations
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/submit">
                  <Rocket className="w-4 h-4 mr-2" />
                  Submit Your Integration
                </Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Join 5,000+ developers building with AI agent tools
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
            <p className="text-gray-600">Find the perfect integration for your AI agent</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{category.name}</CardTitle>
                  <p className="text-sm text-gray-600">{category.count} integrations</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}