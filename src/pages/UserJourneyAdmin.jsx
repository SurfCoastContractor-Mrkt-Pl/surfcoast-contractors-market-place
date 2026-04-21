import React, { useState } from 'react';
import AdminGuard from '@/components/auth/AdminGuard';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ChevronDown, ChevronRight, Search, Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TYPE_LABELS = {
  entrepreneur: 'Entrepreneur',
  client: 'Client',
  farmers_market_vendor: 'Farmers Market Vendor',
  swap_meet_vendor: 'Swap Meet Vendor',
};

const STATUS_CONFIG = {
  started:     { label: 'Started',     color: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  abandoned:   { label: 'Abandoned',   color: 'bg-red-100 text-red-800 border-red-200' },
  completed:   { label: 'Completed',   color: 'bg-green-100 text-green-800 border-green-200' },
};

function ProgressBar({ percent }) {
  const color = percent === 100 ? '#16a34a' : percent >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{ background: '#e5e7eb', borderRadius: 99, height: 6, width: '100%' }}>
      <div style={{ background: color, borderRadius: 99, height: 6, width: `${percent}%`, transition: 'width 0.3s' }} />
    </div>
  );
}

function JourneyRow({ journey }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[journey.status] ?? STATUS_CONFIG.started;
  const fieldsCompleted = journey.fields_completed ?? [];
  const fieldsMissing = journey.fields_missing ?? [];
  const events = journey.events ?? [];

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown style={{ width: 16, flexShrink: 0, color: '#6b7280' }} /> : <ChevronRight style={{ width: 16, flexShrink: 0, color: '#6b7280' }} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{journey.email}</span>
            {journey.name && <span style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>{journey.name}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge variant="outline" style={{ fontSize: 11 }} className={status.color}>{status.label}</Badge>
            <Badge variant="outline" style={{ fontSize: 11, background: '#f3f4f6', color: '#374151' }}>{TYPE_LABELS[journey.signup_type] ?? journey.signup_type}</Badge>
            {journey.last_step_name && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Last step: {journey.last_step_name}</span>
            )}
          </div>
        </div>

        <div style={{ width: 110, flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: journey.completion_percent === 100 ? '#16a34a' : '#374151', marginBottom: 4 }}>
            {journey.completion_percent ?? 0}% complete
          </div>
          <ProgressBar percent={journey.completion_percent ?? 0} />
          {journey.current_step && journey.total_steps && (
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
              Step {journey.current_step} of {journey.total_steps}
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right', minWidth: 90, flexShrink: 0 }}>
          <div>{new Date(journey.started_at ?? journey.created_date).toLocaleDateString()}</div>
          <div style={{ marginTop: 2 }}>
            {new Date(journey.last_activity_at ?? journey.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px', background: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>

            {/* Profile Info Entered */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Profile Info Entered</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { label: 'Name', value: journey.name },
                  { label: 'Phone', value: journey.phone },
                  { label: 'Location', value: journey.location },
                  { label: 'Line of Work', value: journey.line_of_work },
                  { label: 'Contractor Type', value: journey.contractor_type },
                  { label: 'Shop Name', value: journey.shop_name },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} style={{ fontSize: 12 }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>{f.label}: </span>
                    <span style={{ color: '#111827' }}>{f.value}</span>
                  </div>
                ))}
                {![journey.name, journey.phone, journey.location, journey.line_of_work, journey.contractor_type, journey.shop_name].some(Boolean) && (
                  <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>No profile info captured yet</span>
                )}
              </div>
            </div>

            {/* Verification Checklist */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Completion Checklist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { label: 'ID Document Uploaded', done: journey.has_id_document },
                  { label: 'Face Photo Uploaded', done: journey.has_face_photo },
                  { label: 'Credentials Added', done: journey.has_credentials },
                  { label: 'Compliance Acknowledged', done: journey.compliance_acknowledged },
                  { label: 'Profile Created in DB', done: journey.profile_created },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    {item.done
                      ? <CheckCircle2 style={{ width: 13, color: '#16a34a', flexShrink: 0 }} />
                      : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid #d1d5db', flexShrink: 0 }} />}
                    <span style={{ color: item.done ? '#111827' : '#9ca3af' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fields Completed/Missing */}
            {(fieldsCompleted.length > 0 || fieldsMissing.length > 0) && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Form Fields</div>
                {fieldsCompleted.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginBottom: 3 }}>✓ Filled ({fieldsCompleted.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {fieldsCompleted.map(f => (
                        <span key={f} style={{ fontSize: 10, background: '#dcfce7', color: '#166534', borderRadius: 4, padding: '2px 6px' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {fieldsMissing.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginBottom: 3 }}>✗ Missing ({fieldsMissing.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {fieldsMissing.map(f => (
                        <span key={f} style={{ fontSize: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 4, padding: '2px 6px' }}>{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          {events.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Activity Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {events.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                        {e.event?.replace(/_/g, ' ')}
                        {e.step_name ? ` — ${e.step_name}` : ''}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
                        {e.timestamp ? new Date(e.timestamp).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {journey.drop_off_reason && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, fontSize: 12, color: '#9a3412' }}>
              <strong>Drop-off reason:</strong> {journey.drop_off_reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserJourneyAdminContent() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['signup-journeys'],
    queryFn: () => base44.asServiceRole.entities.UserSignupJourney.list('-last_activity_at', 200),
  });

  const filtered = journeys.filter(j => {
    const matchSearch = !search ||
      j.email?.toLowerCase().includes(search.toLowerCase()) ||
      j.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || j.signup_type === filterType;
    const matchStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: journeys.length,
    completed: journeys.filter(j => j.status === 'completed').length,
    abandoned: journeys.filter(j => j.status === 'abandoned').length,
    in_progress: journeys.filter(j => j.status === 'in_progress' || j.status === 'started').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>User Onboarding Journey Tracker</h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
            Track every user's registration progress — what they entered, where they stopped, and whether they completed.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Started', value: stats.total, icon: Users, color: '#2563eb' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#16a34a' },
            { label: 'Abandoned', value: stats.abandoned, icon: AlertTriangle, color: '#dc2626' },
            { label: 'In Progress', value: stats.in_progress, icon: TrendingUp, color: '#d97706' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <s.icon style={{ width: 22, color: s.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, color: '#9ca3af' }} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              style={{ paddingLeft: 32 }}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger style={{ width: 210 }}><SelectValue placeholder="All Account Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Account Types</SelectItem>
              <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="farmers_market_vendor">Farmers Market Vendor</SelectItem>
              <SelectItem value="swap_meet_vendor">Swap Meet Vendor</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger style={{ width: 150 }}><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            {journeys.length === 0
              ? 'No journeys recorded yet. Journeys will appear here as users begin registering.'
              : 'No results match your filters.'}
          </div>
        ) : (
          filtered.map(journey => <JourneyRow key={journey.id} journey={journey} />)
        )}
      </div>
    </div>
  );
}

export default function UserJourneyAdmin() {
  return (
    <AdminGuard>
      <UserJourneyAdminContent />
    </AdminGuard>
  );
}