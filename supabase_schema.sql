-- Create the roadmaps table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    goal TEXT NOT NULL,
    level TEXT NOT NULL,
    duration TEXT NOT NULL,
    roadmap_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- 1. Allow select for users based on their user_id
CREATE POLICY "Users can view their own roadmaps" ON public.roadmaps
    FOR SELECT
    USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

-- 2. Allow insert for authenticated users and guest profile
CREATE POLICY "Users can insert their own roadmaps" ON public.roadmaps
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest-student-123');

-- 3. Allow delete for users based on their user_id
CREATE POLICY "Users can delete their own roadmaps" ON public.roadmaps
    FOR DELETE
    USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can update their own roadmaps" ON public.roadmaps
    FOR UPDATE
    USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

-- Create the chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    preview TEXT,
    messages JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for chat_history
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history" ON public.chat_history
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can insert their own chat history" ON public.chat_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can delete their own chat history" ON public.chat_history
    FOR DELETE USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can update their own chat history" ON public.chat_history
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');


-- Create the quiz_history table
CREATE TABLE IF NOT EXISTS public.quiz_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    score INTEGER NOT NULL,
    quiz_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for quiz_history
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz history" ON public.quiz_history
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can insert their own quiz history" ON public.quiz_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can delete their own quiz history" ON public.quiz_history
    FOR DELETE USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

-- Create the user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    explain_mode TEXT DEFAULT 'Formal',
    favorite_subjects JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

-- Create the presentations table
CREATE TABLE IF NOT EXISTS public.presentations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    style TEXT NOT NULL,
    level TEXT NOT NULL,
    slide_count INTEGER NOT NULL,
    presentation_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for presentations
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own presentations" ON public.presentations
    FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can insert their own presentations" ON public.presentations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can delete their own presentations" ON public.presentations
    FOR DELETE USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');

CREATE POLICY "Users can update their own presentations" ON public.presentations
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id = 'guest-student-123');
