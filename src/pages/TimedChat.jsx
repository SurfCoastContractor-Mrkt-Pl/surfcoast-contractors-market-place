import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader } from 'lucide-react';
import ChatWindow from '../components/messaging/ChatWindow';

export default function TimedChat() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userType, setUserType] = useState(null);
  const [contractorEmail, setContractorEmail] = useState(null);
  const [contractorName, setContractorName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const withEmail = urlParams.get('with');
        const withName = urlParams.get('name');

        if (!withEmail) {
          setError('No contractor specified. Redirecting...');
          setTimeout(() => navigate('/Messaging'), 2000);
          return;
        }

        const user = await base44.auth.me();
        if (!user) {
          base44.auth.redirectToLogin(`/TimedChat?with=${encodeURIComponent(withEmail)}&name=${encodeURIComponent(withName)}`);
          return;
        }

        setUserEmail(user.email);
        setUserName(user.full_name);
        setContractorEmail(withEmail);
        setContractorName(withName || withEmail);

        // Determine user type
        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        setUserType(contractors?.length > 0 ? 'contractor' : 'customer');
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ChatWindow
        otherUserEmail={contractorEmail}
        otherUserName={contractorName}
        userEmail={userEmail}
        userName={userName}
        userType={userType}
        tier="timed"
      />
    </div>
  );
}