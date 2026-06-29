-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'proctor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Exams table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passing_score INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Exam questions table
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options JSONB, -- Array of options for multiple choice
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Exam sessions table
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id),
    user_id UUID REFERENCES public.users(id),
    session_id TEXT UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'aborted', 'terminated')),
    ip_address TEXT,
    user_agent TEXT,
    phone_connected BOOLEAN DEFAULT false,
    laptop_camera_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Exam results table
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    exam_id UUID REFERENCES public.exams(id),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage DECIMAL(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    tab_switch_count INTEGER DEFAULT 0,
    total_alerts INTEGER DEFAULT 0,
    high_severity_alerts INTEGER DEFAULT 0,
    suspicion_level TEXT DEFAULT 'low' CHECK (suspicion_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User answers table
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.exam_questions(id),
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('no_face', 'multiple_faces', 'tab_switch', 'phone_disconnected', 'attention_low', 'suspicious_movement', 'audio_detected')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    message TEXT NOT NULL,
    metadata JSONB, -- Additional context like coordinates, duration, etc.
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Monitoring logs table
CREATE TABLE IF NOT EXISTS public.monitoring_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL CHECK (log_type IN ('face_detection', 'attention_score', 'camera_status', 'phone_status', 'system_event')),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON public.exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_id ON public.exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON public.exam_sessions(status);
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON public.exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_alerts_session_id ON public.alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_session_id ON public.monitoring_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_session_id ON public.user_answers(session_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for exams
CREATE POLICY "Anyone can view active exams" ON public.exams
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can insert exams" ON public.exams
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update exams" ON public.exams
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for exam_sessions
CREATE POLICY "Users can view own sessions" ON public.exam_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.exam_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.exam_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for exam_results
CREATE POLICY "Users can view own results" ON public.exam_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all results" ON public.exam_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for alerts
CREATE POLICY "Users can view own alerts" ON public.alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exam_sessions 
            WHERE id = public.alerts.session_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for monitoring_logs
CREATE POLICY "Users can view own logs" ON public.monitoring_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exam_sessions 
            WHERE id = public.monitoring_logs.session_id AND user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample exam data
INSERT INTO public.exams (title, description, duration_minutes, total_questions, passing_score, created_by)
VALUES 
    ('General Knowledge Test', 'Test your general knowledge across various topics', 30, 10, 60, 
     (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)),
    ('Technical Assessment', 'Evaluate your technical skills and problem-solving abilities', 45, 15, 70,
     (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample questions for the first exam
INSERT INTO public.exam_questions (exam_id, question_text, question_type, options, correct_answer, order_index)
SELECT 
    e.id,
    'What is the capital of France?',
    'multiple_choice',
    '["London", "Berlin", "Paris", "Madrid"]'::jsonb,
    'Paris',
    1
FROM public.exams e
WHERE e.title = 'General Knowledge Test'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
