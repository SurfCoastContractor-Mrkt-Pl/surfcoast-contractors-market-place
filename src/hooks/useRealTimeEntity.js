import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Subscribe to real-time entity updates
 * Usage: const items = useRealTimeEntity('Task', [], { status: 'active' })
 */
export const useRealTimeEntity = (entityName, initialData = [], filter = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    let isMounted = true;

    const init = async () => {
      try {
        // Fetch initial data
        const entity = base44.entities[entityName];
        const initial = await entity.filter(filter, '-created_date', 100);
        if (isMounted) setData(initial);

        // Subscribe to real-time updates
        unsubscribe = entity.subscribe((event) => {
          if (!isMounted) return;

          setData(prev => {
            switch (event.type) {
              case 'create':
                return [event.data, ...prev];
              case 'update':
                return prev.map(item => item.id === event.id ? event.data : item);
              case 'delete':
                return prev.filter(item => item.id !== event.id);
              default:
                return prev;
            }
          });
        });
      } catch (error) {
        console.error(`Error loading ${entityName}:`, error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [entityName, JSON.stringify(filter)]);

  return { data, loading };
};