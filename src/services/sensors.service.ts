import { supabase } from '../lib/supabase';

export const getSensors = async () => {
    const { data, error } = await supabase
        .from('sensors')
        .select(`
            *,
            devices(*)
        `);

    if (error) throw error;

    return data;
};

export const getSensorsByDevice = async (deviceId: string) => {
    const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .eq('device_id', deviceId);

    if (error) throw error;

    return data;
};

export const createSensor = async (
    sensor: {
        type: string
        name: string
        pin: number
        status?: boolean
        device_id: string
    }
) => {
    const { data, error } = await supabase
        .from('sensors')
        .insert(sensor)
        .select()
        .single()

    if (error) throw error

    return data;
};

export const updateSensor = async (
    id: string,
    sensor: {
        type?: string
        name?: string
        status?: boolean
        pin?: number
        device_id?: string
    }
) => {
    const { data, error } = await supabase
        .from('sensors')
        .update(sensor)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const deleteSensor = async (id: string) => {
    const { error } = await supabase
        .from('sensors')
        .delete()
        .eq('id', id);

    if (error) throw error;
};