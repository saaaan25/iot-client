import { useEffect, useState } from 'react'
import type { SecurityEvent } from '../../types'
import { supabase } from '../../lib/supabase'

const typeLabel: Record<string, string> = {
  motion: 'Movimiento', door: 'Puerta', auth: 'Acceso', alert: 'Alerta',
}
const severityColor: Record<string, string> = {
  ok: '#10b981', warning: '#f59e0b', critical: '#f43f5e',
}

interface Props {
  event: SecurityEvent | null
  onClose: () => void
}

export default function EventModal({ event, onClose }: Props) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    let isMounted = true
    setImageUrls([])
    setCurrentIndex(0)

    if (!event) return

    const fetchAllImages = async () => {
      setIsLoading(true)

      try {
        // 1. Transformamos la fecha y hora del evento
        // Ej: date="2026-07-20" -> "20260720"
        const datePart = event.date.replace(/-/g, '');
        // Extraemos solo la hora (Ej: "19:41" -> "19")
        const hourPart = event.time.substring(0, 2);
        // Extraemos el minuto exacto del evento en número (Ej: "19:41" -> 41)
        const eventMinute = parseInt(event.time.substring(3, 5), 10); 
        
        // Prefijo para traer TODAS las fotos de esa hora: "2026072019"
        const searchHourPrefix = `${datePart}${hourPart}`; 

        const { data: files, error } = await supabase.storage
          .from('event-images') // Tu bucket real
          .list('events', {     // Tu carpeta real
            search: searchHourPrefix,
            limit: 100,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) throw error;

        if (files && files.length > 0) {
          // 2. Algoritmo de tolerancia: Buscar fotos con una diferencia máxima de +/- 2 minutos
          const matchedFiles = files.filter(file => {
            // El archivo tiene formato: 20260720194139-01.jpg
            // Extraemos los caracteres de los minutos (posiciones 10 y 11)
            const fileMinuteStr = file.name.substring(10, 12);
            const fileMinute = parseInt(fileMinuteStr, 10);
            
            // Comparamos: ¿La foto se tomó dentro del mismo rango de 2 minutos del evento?
            return Math.abs(fileMinute - eventMinute) <= 2;
          });

          if (matchedFiles.length > 0) {
            // 3. Generamos las URLs públicas
            const urls = matchedFiles.map(file => {
              const { data } = supabase.storage.from('event-images').getPublicUrl(`events/${file.name}`);
              return data.publicUrl;
            });
            if (isMounted) setImageUrls(urls);
          }
        }
      } catch (err) {
        console.error('Error resolviendo imágenes en Storage', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void fetchAllImages()

    return () => {
      isMounted = false
    }
  }, [event])

  if (!event) return null

  const rows = [
    ['ID evento',  event.id],
    ['Fecha',      event.date],
    ['Sensor',     event.sensorId],
    ['Tipo',       typeLabel[event.type] ?? event.type],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)' }}>

        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-medium" style={{ color: '#e2e8f0' }}>{event.label}</h2>
          <button onClick={onClose}
            className="text-lg leading-none cursor-pointer hover:text-white transition-colors"
            style={{ color: '#64748b' }}>✕</button>
        </div>

        <div className="relative w-full rounded-xl mb-4 flex flex-col items-center justify-center bg-[#050a14] border border-[#94a3b820] overflow-hidden group"
          style={{ aspectRatio: '4/3' }}>
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-[#94a3b8]">Buscando ráfagas...</span>
            </div>
          ) : imageUrls.length > 0 ? (
            <>
              <div 
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const width = e.currentTarget.clientWidth;
                  setCurrentIndex(Math.round(scrollLeft / width));
                }}
              >
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                {imageUrls.map((src, idx) => (
                  <div key={idx} className="w-full h-full shrink-0 snap-center flex items-center justify-center relative">
                    <img src={src} alt={`Captura ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {imageUrls.length > 1 && (
                <div className="absolute bottom-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 shadow-xl pointer-events-none transition-opacity">
                  {currentIndex + 1} / {imageUrls.length}
                </div>
              )}
            </>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={severityColor[event.severity]} strokeWidth="1.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-xs font-mono mt-2" style={{ color: '#64748b' }}>
                Sin registro fotográfico
              </span>
            </>
          )}
        </div>

        <div>
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
              <span className="text-sm" style={{ color: '#64748b' }}>{k}</span>
              <span className="text-sm font-mono text-right max-w-[60%] truncate" style={{ color: '#cbd5e1' }}>{v}</span>
            </div>
          ))}
          
          {imageUrls.length > 1 && (
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
              <span className="text-sm text-[#22d3ee] font-medium">Fotos en ráfaga</span>
              <span className="text-sm font-bold text-[#22d3ee]">{imageUrls.length} capturas</span>
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="w-full mt-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
          style={{ border: '1px solid rgba(148,163,184,0.15)', color: '#94a3b8', background: 'transparent' }}
          onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(34,211,238,0.4)'; (e.currentTarget).style.color = '#22d3ee' }}
          onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(148,163,184,0.15)'; (e.currentTarget).style.color = '#94a3b8' }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}