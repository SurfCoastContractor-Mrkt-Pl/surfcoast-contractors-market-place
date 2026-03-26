import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export const useJobAlerts = (contractor, isOnline) => {
  const [newJobs, setNewJobs] = useState([]);
  const [lastCheck, setLastCheck] = useState(new Date());

  const checkNewJobs = useCallback(async () => {
    if (!contractor?.email || !isOnline) return;

    try {
      const now = new Date();
      // Fetch jobs posted since last check
      const recentJobs = await base44.entities.ScopeOfWork.filter({
        status: 'pending_approval',
        created_date: {
          $gte: lastCheck.toISOString()
        }
      });

      if (recentJobs?.length > 0) {
        // Filter jobs matching contractor's skills/trade
        const matchingJobs = recentJobs.filter(job => {
          const tradeMatch = !job.trade_needed || 
            job.trade_needed === contractor.trade_specialty ||
            job.trade_needed === 'other';
          const typeMatch = !job.contractor_type_needed ||
            job.contractor_type_needed === 'either' ||
            job.contractor_type_needed === contractor.contractor_type;
          return tradeMatch && typeMatch;
        });

        if (matchingJobs.length > 0) {
          setNewJobs(prev => [...matchingJobs, ...prev].slice(0, 10));
        }
      }

      setLastCheck(now);
    } catch (error) {
      console.warn('Failed to check for new jobs:', error);
    }
  }, [contractor, isOnline, lastCheck]);

  // Poll every 2 minutes when online
  useEffect(() => {
    if (!isOnline) return;

    checkNewJobs();
    const interval = setInterval(checkNewJobs, 120000);
    return () => clearInterval(interval);
  }, [isOnline, checkNewJobs]);

  const dismissJob = useCallback((jobId) => {
    setNewJobs(prev => prev.filter(j => j.id !== jobId));
  }, []);

  return { newJobs, dismissJob, checkNewJobs };
};