// Supabase is optional - try to import if available
let createClient: any;
try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch {
  createClient = null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are not set
const createMockClient = () => ({
  auth: {
    signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: new Error('Supabase not configured') })
      })
    }),
    upsert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: new Error('Supabase not configured') })
      })
    })
  })
});

export const supabase = (supabaseUrl && supabaseAnonKey && createClient)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Auth helper functions
export const signInWithGoogle = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Mock sign in for development
    console.log('Mock Google sign in - Supabase not configured');
    return { data: null, error: null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/onboarding`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, profile: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...profile })
    .select()
    .single();
  return { data, error };
};
