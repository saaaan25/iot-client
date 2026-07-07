import { supabase } from '../lib/supabase';

export const getEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            sensors(*)
        `)
        .order('event_date', {
            ascending: false
        });

    if (error) throw error;

    return data;
};

export const getEventsBySensor = async (sensorId: string) => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('sensor_id', sensorId);

    if (error) throw error;

    return data;
};

export const createEvent = async (
    event: {
        sensor_id: string
        type: string
        value: string
    }
) => {
    const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const deleteEvent = async (id: string) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) throw error;
};