-- ForgeLink Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MCP Servers Table
CREATE TABLE mcp_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Technical Details
    github_url TEXT,
    npm_package TEXT,
    install_command TEXT,
    category TEXT NOT NULL,
    transport_types TEXT[] DEFAULT ARRAY['stdio'],
    
    -- Metadata
    author_name TEXT NOT NULL,
    author_email TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    logo_url TEXT,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    server_count INTEGER DEFAULT 0
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    UNIQUE(server_id, user_id)
);

-- User Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    github_username TEXT,
    is_developer BOOLEAN DEFAULT FALSE
);

-- Server Tags Table (for better search)
CREATE TABLE server_tags (
    server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (server_id, tag)
);

-- Indexes for performance
CREATE INDEX idx_servers_category ON mcp_servers(category);
CREATE INDEX idx_servers_status ON mcp_servers(status);
CREATE INDEX idx_servers_featured ON mcp_servers(is_featured);
CREATE INDEX idx_servers_slug ON mcp_servers(slug);
CREATE INDEX idx_reviews_server ON reviews(server_id);
CREATE INDEX idx_server_tags_tag ON server_tags(tag);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Database', 'database', 'Connect to SQL, NoSQL, and vector databases', '🗄️'),
('Productivity', 'productivity', 'Notion, Slack, Google Workspace, and more', '📝'),
('Development', 'development', 'GitHub, GitLab, CI/CD, and dev tools', '⚡'),
('Communication', 'communication', 'Email, SMS, messaging platforms', '💬'),
('Analytics', 'analytics', 'Data analysis and visualization tools', '📊'),
('Finance', 'finance', 'Payment processing, accounting, banking APIs', '💰'),
('AI & ML', 'ai-ml', 'Machine learning models and AI services', '🤖'),
('Cloud', 'cloud', 'AWS, Azure, GCP, and cloud infrastructure', '☁️');

-- Row Level Security (RLS) Policies
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public can read approved servers
CREATE POLICY "Public servers are viewable by everyone"
    ON mcp_servers FOR SELECT
    USING (status = 'approved');

-- Authenticated users can insert servers
CREATE POLICY "Authenticated users can create servers"
    ON mcp_servers FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Users can update their own servers
CREATE POLICY "Users can update own servers"
    ON mcp_servers FOR UPDATE
    USING (auth.uid() = author_id);

-- Public can read reviews
CREATE POLICY "Reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for mcp_servers
CREATE TRIGGER update_mcp_servers_updated_at BEFORE UPDATE ON mcp_servers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update rating average
CREATE OR REPLACE FUNCTION update_server_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mcp_servers
    SET 
        rating_avg = (SELECT AVG(rating) FROM reviews WHERE server_id = NEW.server_id),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE server_id = NEW.server_id)
    WHERE id = NEW.server_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for review rating updates
CREATE TRIGGER update_rating_on_review AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_server_rating();
