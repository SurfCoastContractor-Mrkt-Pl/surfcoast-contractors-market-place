import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useMarketingIntegrations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendSMS = useCallback(async (phoneNumber, message) => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('sendSMS', {
        phoneNumber,
        message
      });
      setError(null);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (email, subject, body) => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.SendEmail({
        to: email,
        subject,
        body
      });
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const shareToSocial = useCallback(async (platform, message, imageUrl) => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('shareToSocial', {
        platform,
        message,
        imageUrl
      });
      setError(null);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendSMS, sendEmail, shareToSocial, loading, error };
}