import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database helper functions
export const db = {
  // Users
  getUser: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateUser: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Exams
  getExams: async (filters = {}) => {
    let query = supabase
      .from('exams')
      .select('*')
      .eq('is_active', true)

    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy)
    }

    const { data, error } = await query
    return { data, error }
  },

  getExamById: async (examId) => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()
    return { data, error }
  },

  getExamQuestions: async (examId) => {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('order_index', { ascending: true })
    return { data, error }
  },

  createExam: async (examData) => {
    const { data, error } = await supabase
      .from('exams')
      .insert(examData)
      .select()
      .single()
    return { data, error }
  },

  // Exam Sessions
  createExamSession: async (sessionData) => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .insert(sessionData)
      .select()
      .single()
    return { data, error }
  },

  updateExamSession: async (sessionId, updates) => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },

  getExamSession: async (sessionId) => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    return { data, error }
  },

  getUserSessions: async (userId) => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*, exams(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Exam Results
  createExamResult: async (resultData) => {
    const { data, error } = await supabase
      .from('exam_results')
      .insert(resultData)
      .select()
      .single()
    return { data, error }
  },

  getExamResult: async (sessionId) => {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    return { data, error }
  },

  getUserResults: async (userId) => {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, exams(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // User Answers
  saveUserAnswer: async (answerData) => {
    const { data, error } = await supabase
      .from('user_answers')
      .insert(answerData)
      .select()
      .single()
    return { data, error }
  },

  getSessionAnswers: async (sessionId) => {
    const { data, error } = await supabase
      .from('user_answers')
      .select('*, exam_questions(*)')
      .eq('session_id', sessionId)
    return { data, error }
  },

  // Alerts
  createAlert: async (alertData) => {
    const { data, error } = await supabase
      .from('alerts')
      .insert(alertData)
      .select()
      .single()
    return { data, error }
  },

  getSessionAlerts: async (sessionId) => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Monitoring Logs
  createMonitoringLog: async (logData) => {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .insert(logData)
      .select()
      .single()
    return { data, error }
  },

  getSessionLogs: async (sessionId) => {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// Auth helper functions
export const auth = {
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}
