import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { mcpServers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

async function getServer(id: string) {
  const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, id));
  return servers[0] || null;
}

async function approveServer(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await db.update(mcpServers)
    .set({ status: 'approved' })
    .where(eq(mcpServers.id, id));
  redirect('/admin');
}

async function rejectServer(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await db.update(mcpServers)
    .set({ status: 'rejected' })
    .where(eq(mcpServers.id, id));
  redirect('/admin');
}

async function toggleVerified(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const currentValue = formData.get('currentValue') === 'true';
  await db.update(mcpServers)
    .set({ isVerified: !currentValue })
    .where(eq(mcpServers.id, id));
  redirect(`/admin/server/${id}`);
}

async function toggleFeatured(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const currentValue = formData.get('currentValue') === 'true';
  await db.update(mcpServers)
    .set({ isFeatured: !currentValue })
    .where(eq(mcpServers.id, id));
  redirect(`/admin/server/${id}`);
}

export default async function AdminServerPage({ params }: { params: { id: string } }) {
  const server = await getServer(params.id);
  if (!server) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/admin" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{server.name}</CardTitle>
                <p className="text-gray-600">{server.tagline}</p>
              </div>
              <Badge variant={
                server.status === 'approved' ? 'default' :
                server.status === 'pending' ? 'secondary' :
                'destructive'
              }>
                {server.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-sm text-gray-600">{server.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Category</h3>
                <p className="text-sm">{server.category}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Author</h3>
                <p className="text-sm">{server.authorName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-sm">{server.authorEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Install Command</h3>
                <p className="text-sm font-mono">{server.installCommand}</p>
              </div>
            </div>

            {server.githubUrl && (
              <div>
                <h3 className="font-semibold mb-1">GitHub</h3>
                <a href={server.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  {server.githubUrl}
                </a>
              </div>
            )}

            {server.npmPackage && (
              <div>
                <h3 className="font-semibold mb-1">NPM Package</h3>
                <p className="text-sm">{server.npmPackage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Actions */}
          {server.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <form action={approveServer}>
                  <input type="hidden" name="id" value={server.id} />
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    ✓ Approve Server
                  </Button>
                </form>
                <form action={rejectServer}>
                  <input type="hidden" name="id" value={server.id} />
                  <Button type="submit" variant="destructive" className="w-full">
                    ✗ Reject Server
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Premium Features */}
          <Card>
            <CardHeader>
              <CardTitle>Premium Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <form action={toggleVerified}>
                <input type="hidden" name="id" value={server.id} />
                <input type="hidden" name="currentValue" value={String(server.isVerified)} />
                <Button type="submit" variant="outline" className="w-full">
                  {server.isVerified ? '✓ Verified' : 'Mark as Verified'} ($99)
                </Button>
              </form>
              <form action={toggleFeatured}>
                <input type="hidden" name="id" value={server.id} />
                <input type="hidden" name="currentValue" value={String(server.isFeatured)} />
                <Button type="submit" variant="outline" className="w-full">
                  {server.isFeatured ? '★ Featured' : 'Mark as Featured'} ($199/mo)
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}