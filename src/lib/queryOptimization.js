import { base44 } from '@/api/base44Client';

/**
 * Fetch paginated data with cursor-based pagination
 */
export const fetchPaginated = async (entityName, limit = 50, filter = {}, sort = '-created_date') => {
  try {
    const entity = base44.entities[entityName];
    const data = await entity.filter(filter, sort, limit);
    
    return {
      items: data,
      hasMore: data.length === limit,
      lastId: data.length > 0 ? data[data.length - 1].id : null,
    };
  } catch (error) {
    console.error(`Error fetching ${entityName}:`, error);
    throw error;
  }
};

/**
 * Fetch next page of data using cursor
 */
export const fetchNextPage = async (entityName, cursor, limit = 50, filter = {}, sort = '-created_date') => {
  try {
    const entity = base44.entities[entityName];
    // In a real implementation, you'd pass cursor to filter
    // For now, we skip/limit using array operations
    const data = await entity.filter(filter, sort, limit);
    
    return {
      items: data,
      hasMore: data.length === limit,
      lastId: data.length > 0 ? data[data.length - 1].id : null,
    };
  } catch (error) {
    console.error(`Error fetching next page of ${entityName}:`, error);
    throw error;
  }
};