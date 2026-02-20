import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '../components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://forgelink-pi.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL('https://forgelink-pi.vercel.app'),
  title: {
    default: 'ForgeLink — AI Agent Integration Marketplace',
    template: '%s | ForgeLink',
  },
  description: 'Discover and share production-ready MCP servers, OpenAI GPT Actions, and LangChain tools. Connect AI agents to databases, APIs, and services.',
  keywords: ['MCP server', 'AI agent', 'Model Context Protocol', 'GPT Actions', 'LangChain tools', 'AI integration', 'Claude MCP', 'OpenAI plugins'],
  authors: [{ name: 'ForgeLink' }],
  creator: 'ForgeLink',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'ForgeLink',
    title: 'ForgeLink — AI Agent Integration Marketplace',
    description: 'Discover production-ready MCP servers, GPT Actions, and LangChain tools for AI agents.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ForgeLink — AI Agent Integration Marketplace',
    description: 'Discover production-ready MCP servers, GPT Actions, and LangChain tools for AI agents.',
    site: '@forgelink',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
