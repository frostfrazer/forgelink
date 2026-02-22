import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../lib/db';
import { mcpServers, serverTags } from '../../../lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { Nav } from '../../../components/nav';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Star, Download, ArrowRight, Database, Cloud, MessageSquare, Code2, BarChart2, DollarSign, Bot, Package } from 'lucide-react';
import type { Metadata } from 'next';

const CATEGORIES: Record<string, {
  label: string; icon: React.ReactNode; color: string;
  headline: string; description: string; keywords: string;
}> = {
  database: {
    label: 'Database',
    icon: <Database className="w-8 h-8 text-white" />,
    color: 'from-blue-500 to-blue-700',
    headline: 'Database MCP Servers & AI Integrations',
    description: 'Connect your AI agents to PostgreSQL, MySQL, MongoDB, Redis, and more. Production-ready MCP servers and LangChain tools for database operations.',
    keywords: 'database MCP server, PostgreSQL AI agent, MySQL LangChain, MongoDB MCP, Redis AI integration',
  },
  development: {
    label: 'Development',
    icon: <Code2 className="w-8 h-8 text-white" />,
    color: 'from-gray-600 to-gray-800',
    headline: 'Development Tools for AI Agents',
    description: 'MCP servers and GPT Actions for code execution, GitHub integration, CI/CD pipelines, and developer tooling. Build smarter AI-powered development workflows.',
    keywords: 'development MCP server, GitHub AI agent, code execution LangChain, CI/CD AI integration, developer tools GPT',
  },
  communication: {
    label: 'Communication',
    icon: <MessageSquare className="w-8 h-8 text-white" />,
    color: 'from-green-500 to-green-700',
    headline: 'Communication AI Integrations',
    description: 'Connect AI agents to Slack, email, Discord, Twilio, and messaging platforms. Automate notifications, summaries, and multi-channel communication workflows.',
    keywords: 'Slack MCP server, email AI agent, Discord LangChain, communication AI integration, messaging GPT action',
  },
  productivity: {
    label: 'Productivity',
    icon: <Package className="w-8 h-8 text-white" />,
    color: 'from-yellow-500 to-yellow-700',
    headline: 'Productivity MCP Servers & Integrations',
    description: 'AI agent integrations for Google Workspace, Notion, Airtable, calendars, and task management. Automate your productivity stack with MCP and GPT Actions.',
    keywords: 'productivity MCP server, Notion AI agent, Google Workspace LangChain, Airtable MCP, calendar AI integration',
  },
  cloud: {
    label: 'Cloud',
    icon: <Cloud className="w-8 h-8 text-white" />,
    color: 'from-purple-500 to-purple-700',
    headline: 'Cloud Infrastructure AI Integrations',
    description: 'MCP servers for AWS, GCP, Azure, and cloud-native services. Let AI agents provision resources, query logs, and manage your cloud infrastructure.',
    keywords: 'AWS MCP server, cloud AI agent, GCP LangChain integration, Azure AI tool, cloud infrastructure GPT',
  },
  finance: {
    label: 'Finance',
    icon: <DollarSign className="w-8 h-8 text-white" />,
    color: 'from-emerald-500 to-emerald-700',
    headline: 'Finance & Payments AI Integrations',
    description: 'Connect AI agents to Stripe, payment gateways, accounting tools, and financial APIs. Production-ready MCP servers for fintech and payment automation.',
    keywords: 'Stripe MCP server, payments AI agent, finance LangChain, accounting AI integration, fintech GPT action',
  },
  'ai-ml': {
    label: 'AI & ML',
    icon: <Bot className="w-8 h-8 text-white" />,
    color: 'from-pink-500 to-pink-700',
    headline: 'AI & Machine Learning Integrations',
    description: 'Chain AI models, vector databases, and ML pipelines with MCP servers. Hugging Face, Pinecone, Weaviate, and model serving integrations for agentic workflows.',
    keywords: 'AI ML MCP server, Pinecone LangChain, vector database AI, Hugging Face GPT, ML pipeline agent',
  },
  analytics: {
    label: 'Analytics',
    icon: <BarChart2 className="w-8 h-8 text-white" />,
    color: 'from-orange-500 to-orange-700',
    headline: 'Analytics & Data AI Integrations',
    description: 'MCP servers for Mixpanel, Amplitude, BigQuery, Snowflake, and business intelligence tools. Give AI agents access to your data warehouse and analytics stack.',
    keywords: 'analytics MCP server, BigQuery AI agent, Snowflake LangChain, Mixpanel MCP, BI tool GPT action',
  },
};

// Map URL slug → DB category name
const SLUG_TO_CATEGORY: Record<string, string> = {
  database: 'Database', development: 'Development', communication: 'Communication',
  productivity: 'Productivity', cloud: 'Cloud', finance: 'Finance',
  'ai-ml': 'AI & ML', analytics: 'Analytics',
};

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = CATEGORIES[params.slug];
  if (!cat) return { title: 'Not Found' };
  return {
    title: `${cat.headline} | ForgeLink`,
    description: cat.description,
    keywords: cat.keywords,
    openGraph: { title: `${cat.headline} | ForgeLink`, description: cat.description },
    twitter: { card: 'summary', title: `${cat.headline} | ForgeLink`, description: cat.description },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = CATEGORIES[params.slug];
  if (!cat) notFound();

  const dbCategory = SLUG_TO_CATEGORY[params.slug];

  const servers = await db.select().from(mcpServers)
    .where(eq(mcpServers.status, 'approved') && eq(mcpServers.category, dbCategory) as any)
    .orderBy(desc(mcpServers.isFeatured), desc(mcpServers.isVerified), desc(mcpServers.viewCount))
    .limit(24);

  // Attach tags
  const ids = servers.map(s => s.id);
  const tagRows = ids.length > 0
    ? await db.select().from(serverTags).where(inArray(serverTags.serverId, ids))
    : [];
  const tagMap: Record<string, string[]> = {};
  for (const t of tagRows) {
    if (!tagMap[t.serverId]) tagMap[t.serverId] = [];
    tagMap[t.serverId].push(t.tag);
  }
  const enriched = servers.map(s => ({ ...s, tags: tagMap[s.id] ?? [] }));

  // JSON-LD schema for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.headline,
    description: cat.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/category/${params.slug}`,
    numberOfItems: servers.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-5 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0`}>
              {cat.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{cat.headline}</h1>
              <p className="text-gray-500 mt-1 text-lg">{enriched.length} integration{enriched.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl text-lg leading-relaxed">{cat.description}</p>
          <div className="flex gap-3 mt-6 flex-wrap">
            <Link href={`/browse?category=${encodeURIComponent(dbCategory)}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Browse all {cat.label} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/submit"
              className="inline-flex items-center gap-2 border border-gray-300 hover:border-blue-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors bg-white">
              Submit a {cat.label} integration
            </Link>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {enriched.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No {cat.label} integrations listed yet.</p>
            <Link href="/submit" className="text-blue-600 font-semibold hover:underline">Be the first to submit one →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enriched.map(server => (
              <Link key={server.id} href={`/server/${server.slug}`}>
                <Card className="h-full hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                        {cat.icon}
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {server.isVerified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                        <Badge variant="outline" className="text-xs">{server.protocol}</Badge>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1 group-hover:text-blue-600 transition-colors">{server.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{server.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{server.description}</p>
                    {server.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {server.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{server.ratingAvg || '0.0'}</span>
                      <span className="flex items-center gap-1"><Download className="w-4 h-4" />{(server.installCount ?? 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* SEO content block */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What are {cat.label} AI integrations?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            {cat.label} integrations on ForgeLink are production-ready connectors that let AI agents — built on Claude, GPT-4, LangChain, or AutoGPT — interact with {cat.label.toLowerCase()} systems and APIs. Each integration follows the Model Context Protocol (MCP) or a compatible standard, making them plug-and-play with any modern AI agent framework.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Whether you're building autonomous agents, RAG pipelines, or AI-powered automations, ForgeLink's {cat.label.toLowerCase()} integrations give your agent the tools it needs to take real actions — not just generate text.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href={`/browse?category=${encodeURIComponent(dbCategory)}`}
              className="text-blue-600 font-semibold hover:underline text-sm">
              Browse all {cat.label} integrations →
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/submit" className="text-blue-600 font-semibold hover:underline text-sm">
              Submit your {cat.label.toLowerCase()} integration →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
