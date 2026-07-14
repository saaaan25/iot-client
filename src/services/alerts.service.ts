import { supabase } from '../lib/supabase';

export const getAlerts = async () => {
    const { data, error } = await supabase
        .from('alerts')
        .select(`
            *,
            events(*)
        `)
        .order('created_at', {
            ascending: false
        });

    if (error) throw error;

    return data;
};

export const createAlert = async (
    alert: {
        event_id: string
        message: string
        status: string
    }
) => {
    const { data, error } = await supabase
        .from('alerts')
        .insert(alert)
        .select()
        .single()

    if (error) throw error;

    return data;
};

export const updateAlert = async (id: string, status: string) => {
    const { data, error } = await supabase
        .from('alerts')
        .update({
            status
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const deleteAlert = async (id: string) => {
    const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

    if (error) throw error;
};