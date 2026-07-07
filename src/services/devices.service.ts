import { supabase } from '../lib/supabase';

export const getDevices = async () => {
    const { data, error } = await supabase
        .from('devices')
        .select('*');

    if (error) throw error;

    return data;
};

export const getDeviceById = async (id: string) => {
    const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    return data;
};

export const createDevice = async (
    device: {
        name: string
        address: string
        ubication: string
        status?: boolean
        user_id: string
    }
) => {
    const { data, error } = await supabase
        .from('devices')
        .insert(device)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const updateDevice = async (
    id: string,
    device: {
        name?: string
        address?: string
        ubication?: string
        status?: boolean
    }
) => {
    const { data, error } = await supabase
        .from('devices')
        .update(device)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const deleteDevice = async (id: string) => {
    const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', id);

    if (error) throw error;
};