import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          navigate('/');
          return;
        }

        const contractors = await base44.entities.Contractor.filter({ email: user.email });
        if (contractors && contractors.length > 0) {
          setUserType('contractor');
        } else {
          setUserType('customer');
        }
      } catch (error) {
        console.error('Error checking user type:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkUserType();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      {userType === 'contractor' && <ContractorDashboard />}
      {userType === 'customer' && <CustomerDashboard />}
    </>
  );
}