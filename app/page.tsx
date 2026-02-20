import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Database, Zap, Cloud, MessageSquare, Code2, BarChart2, DollarSign, Bot, Package, Search, Rocket, Star, Download, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { db } from '../lib/db';
import { mcpServers } from '../lib/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { Nav } from '../components/nav';
import { WaitlistForm } from '../components/waitlist-form';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Database':      <Database className="w-6 h-6 text-white" />,
  'Cloud':         <Cloud className="w-6 h-6 text-white" />,
  'Communication': <MessageSquare className="w-6 h-6 text-white" />,
  'Development':   <Code2 className="w-6 h-6 text-white" />,
  'Analytics':     <BarChart2 className="w-6 h-6 text-white" />,
  'Finance':       <DollarSign className="w-6 h-6 text-white" />,
  'AI & ML':       <Bot className="w-6 h-6 text-white" />,
  'Productivity':  <Package className="w-6 h-6 text-white" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Database':      'from-blue-500 to-blue-700',
  'Cloud':         'from-purple-500 to-purple-700',
  'Communication': 'from-green-500 to-green-700',
  'Development':   'from-gray-600 to-gray-800',
  'Analytics':     'from-orange-500 to-orange-700',
  'Finance':       'from-emerald-500 to-emerald-700',
  'AI & ML':       'from-pink-500 to-pink-700',
  'Productivity':  'from-yellow-500 to-yellow-700',
};

async function getFeaturedServers() {
  return db.select().from(mcpServers)
    .where(and(eq(mcpServers.status, 'approved'), eq(mcpServers.isFeatured, true)))
    .orderBy(desc(mcpServers.viewCount))
    .limit(3);
}

async function getTopServers() {
  return db.select().from(mcpServers)
    .where(eq(mcpServers.status, 'approved'))
    .orderBy(desc(mcpServers.installCount))
    .limit(3);
}

async function getTotalCount() {
  const result = await db.select({ count: count() }).from(mcpServers)
    .where(eq(mcpServers.status, 'approved'));
  return result[0]?.count ?? 0;
}

export default async function Home() {
  const [featured, top, total] = await Promise.all([
    getFeaturedServers(),
    getTopServers(),
    getTotalCount(),
  ]);

  const displayServers = featured.length >= 3 ? featured : top;

  const categories = [
    { icon: 'Database',      name: 'Database',      color: 'from-blue-500 to-blue-700',    href: '/browse?category=Database' },
    { icon: 'Development',   name: 'Development',   color: 'from-gray-600 to-gray-800',    href: '/browse?category=Development' },
    { icon: 'Productivity',  name: 'Productivity',  color: 'from-yellow-500 to-yellow-700',href: '/browse?category=Productivity' },
    { icon: 'Cloud',         name: 'Cloud',         color: 'from-purple-500 to-purple-700',href: '/browse?category=Cloud' },
    { icon: 'Communication', name: 'Communication', color: 'from-green-500 to-green-700',  href: '/browse?category=Communication' },
    { icon: 'Finance',       name: 'Finance',       color: 'from-emerald-500 to-emerald-700', href: '/browse?category=Finance' },
    { icon: 'AI & ML',       name: 'AI & ML',       color: 'from-pink-500 to-pink-700',    href: '/browse?category=AI+%26+ML' },
    { icon: 'Analytics',     name: 'Analytics',     color: 'from-orange-500 to-orange-700',href: '/browse?category=Analytics' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 text-sm px-4 py-1">
            MCP · OpenAI GPT Actions · LangChain · AutoGPT
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-gray-900">
            The AI Agent
            <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Integration Hub
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Discover and share production-ready connectors that let AI agents interact with databases, APIs, and services.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/browse">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base">
                <Search className="w-4 h-4 mr-2" />
                Browse Integrations
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                <Rocket className="w-4 h-4 mr-2" />
                Submit Free
              </Button>
            </Link>
          </div>
          <div className="flex justify-center gap-12 mt-12 flex-wrap">
            {[[`${total}+`, 'Integrations'], ['8', 'Categories'], ['MCP', 'Protocol'], ['Free', 'to List']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{val}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Top Servers */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {featured.length >= 3 ? 'Featured Integrations' : 'Most Popular'}
              </h2>
              <p className="text-gray-500">Trusted by thousands of AI developers</p>
            </div>
            <Link href="/browse" className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayServers.map(server => (
              <Link key={server.id} href={`/server/${server.slug}`}>
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700'} flex items-center justify-center`}>
                      {CATEGORY_ICONS[server.category] ?? <Zap className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex gap-1">
                      {server.isVerified && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Verified</span>}
                      {server.isFeatured && <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">Featured</span>}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{server.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{server.tagline}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {server.ratingAvg}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {(server.installCount ?? 0).toLocaleString()}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{server.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
            <p className="text-gray-500">Find the right integration for your AI stack</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link key={cat.name} href={cat.href}>
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                    {CATEGORY_ICONS[cat.icon]}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why ForgeLink */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why ForgeLink?</h2>
            <p className="text-gray-500">The fastest way to discover and ship AI agent integrations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Smart Discovery', desc: 'Search and filter across protocols, categories, and ratings. No more digging through GitHub repos.', color: 'bg-blue-100 text-blue-600' },
              { icon: Shield, title: 'Verified Quality', desc: 'Every verified server is tested by our team. See real ratings and install counts from the community.', color: 'bg-green-100 text-green-600' },
              { icon: CheckCircle, title: 'One-Click Install', desc: 'Copy-paste install commands that just work. Clear docs and code examples get you up in minutes.', color: 'bg-purple-100 text-purple-600' },
            ].map(f => (
              <div key={f.title} className="text-center p-6">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mx-auto mb-4`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built an MCP server or AI integration?</h2>
          <p className="text-blue-100 text-xl mb-8">Share it with thousands of developers. First 10 listings get a free Verified badge.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/submit">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 h-12 text-base font-semibold">
                Submit Your Integration Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-700 px-8 h-12 text-base">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Stay in the loop</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Get notified about new integrations
          </h2>
          <p className="text-gray-400 mb-8">
            New MCP servers, GPT Actions, and LangChain tools added weekly. No spam, unsubscribe anytime.
          </p>
          <div className="flex justify-center">
            <WaitlistForm source="homepage-footer" dark />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">ForgeLink</span>
              </div>
              <p className="text-sm">The premier marketplace for AI agent integrations.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="hover:text-white">Browse</Link></li>
                <li><Link href="/submit" className="hover:text-white">Submit</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse?category=Database" className="hover:text-white">Database</Link></li>
                <li><Link href="/browse?category=Development" className="hover:text-white">Development</Link></li>
                <li><Link href="/browse?category=Analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/browse?category=AI+%26+ML" className="hover:text-white">AI & ML</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/signin" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            &copy; 2025 ForgeLink. Built for the agentic future.
          </div>
        </div>
      </footer>
    </div>
  );
}
