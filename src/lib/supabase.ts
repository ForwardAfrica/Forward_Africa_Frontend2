// Supabase integration removed
// All functions below are disabled to prevent accidental usage.

export const supabase = null as any;

const notConfigured = async (name: string) => {
  const error = new Error(`Supabase integration has been removed: ${name} is unavailable`);
  console.warn(error.message);
  return { data: null, error };
};

export const signInWithGoogle = async () => {
  return await notConfigured('signInWithGoogle');
};

export const signOut = async () => {
  return await notConfigured('signOut');
};

export const getCurrentUser = async () => {
  return await notConfigured('getCurrentUser');
};

export const getUserProfile = async (userId: string) => {
  return await notConfigured('getUserProfile');
};

export const updateUserProfile = async (userId: string, profile: any) => {
  return await notConfigured('updateUserProfile');
};
