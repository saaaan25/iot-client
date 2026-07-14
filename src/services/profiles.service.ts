import { supabase } from '../lib/supabase';

export const getProfile = async (id: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    return data;
};

export const updateProfile = async (
    id: string,
    profile: {
        name?: string
        last_name?: string
        phone?: string
    }
) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const deleteProfile = async (id: string) => {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) throw error;
};