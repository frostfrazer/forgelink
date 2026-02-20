import { db } from '@/lib/db';
import { mcpServers } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getStats() {
  const allServers = await db.select().from(mcpServers);
  
  return {
    total: allServers.length,
    pending: allServers.filter(s => s.status === 'pending').length,
    approved: allServers.filter(s => s.status === 'approved').length,
    rejected: allServers.filter(s => s.status === 'rejected').length,
    verified: allServers.filter(s => s.isVerified).length,
    featured: allServers.filter(s => s.isFeatured).length,
  };
}

async function getPendingServers() {
  return await db.select()
    .from(mcpServers)
    .orderBy(desc(mcpServers.createdAt))
    .limit(50);
}

export default async function AdminPage() {
  const stats = await getStats();
  const servers = await getPendingServers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage ForgeLink marketplace</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total Servers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.verified}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.featured}</div>
            </CardContent>
          </Card>
        </div>

        {/* Server List */}
        <Card>
          <CardHeader>
            <CardTitle>All Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {servers.map(server => (
                <div key={server.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{server.name}</h3>
                        <Badge variant={
                          server.status === 'approved' ? 'default' :
                          server.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {server.status}
                        </Badge>
                        {server.isVerified && <Badge variant="outline">Verified</Badge>}
                        {server.isFeatured && <Badge className="bg-purple-100 text-purple-700">Featured</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{server.tagline}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Category: {server.category}</span>
                        <span>Author: {server.authorName}</span>
                        <span>Views: {server.viewCount}</span>
                        <span>Installs: {server.installCount}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/admin/server/${server.id}`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}