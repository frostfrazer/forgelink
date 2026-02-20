import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { mcpServers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Download, Github, Verified } from 'lucide-react';
import { Nav } from '@/components/nav';

async function getServer(slug: string) {
  const servers = await db.select().from(mcpServers).where(eq(mcpServers.slug, slug));
  return servers[0] || null;
}

export default async function ServerPage({ params }: { params: { slug: string } }) {
  const server = await getServer(params.slug);
  if (!server) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-4xl">⚡</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{server.name}</h1>
                {server.isVerified && (
                  <Badge variant="secondary">
                    <Verified className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xl text-gray-600 mb-4">{server.tagline}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{server.ratingAvg}</span>
                  <span className="text-gray-500">({server.ratingCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Download className="w-5 h-5" />
                  <span>{server.installCount?.toLocaleString()} installs</span>
                </div>
                <Badge variant="outline">{server.category}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{server.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="mb-2 text-gray-400"># Install via npm</div>
                  <code>{server.installCommand}</code>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {server.githubUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={server.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Author:</span>
                  <p className="font-semibold">{server.authorName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-semibold">{server.category}</p>
                </div>
                {server.npmPackage && (
                  <div>
                    <span className="text-gray-600">Package:</span>
                    <p className="font-mono text-xs">{server.npmPackage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
