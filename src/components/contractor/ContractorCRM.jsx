import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Phone, Mail, FileText, Calendar, Tag, ChevronRight, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractorCRM() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Contact Form State
  const [newContact, setNewContact] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    status: 'lead',
    source: 'direct_contact',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;

      const userContacts = await base44.entities.CRMContact.filter({
        contractor_email: user.email
      });
      setContacts(userContacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load CRM contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const user = await base44.auth.me();
      await base44.entities.CRMContact.create({
        contractor_id: user.id,
        contractor_email: user.email,
        ...newContact
      });
      toast.success('Contact added successfully');
      setShowAddForm(false);
      setNewContact({
        client_name: '',
        client_email: '',
        client_phone: '',
        status: 'lead',
        source: 'direct_contact',
        priority: 'medium',
        notes: ''
      });
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (contact.client_email && contact.client_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'active_client': return 'bg-green-100 text-green-800';
      case 'past_client': return 'bg-slate-100 text-slate-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Client CRM</h2>
          <p className="text-slate-500">Manage your leads, clients, and pipeline</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Contact
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-slate-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-lg">Add New Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name *</label>
                  <Input 
                    required 
                    value={newContact.client_name} 
                    onChange={e => setNewContact({...newContact, client_name: e.target.value})} 
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <Input 
                    type="email"
                    value={newContact.client_email} 
                    onChange={e => setNewContact({...newContact, client_email: e.target.value})} 
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <Input 
                    value={newContact.client_phone} 
                    onChange={e => setNewContact({...newContact, client_phone: e.target.value})} 
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Pipeline Status</label>
                  <Select 
                    value={newContact.status} 
                    onValueChange={val => setNewContact({...newContact, status: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">New Lead</SelectItem>
                      <SelectItem value="prospect">Prospect / Quoting</SelectItem>
                      <SelectItem value="active_client">Active Client</SelectItem>
                      <SelectItem value="past_client">Past Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <Input 
                  value={newContact.notes} 
                  onChange={e => setNewContact({...newContact, notes: e.target.value})} 
                  placeholder="How did they find you? What do they need?"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit">Save Contact</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search clients by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contacts</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="prospect">Prospects</SelectItem>
            <SelectItem value="active_client">Active Clients</SelectItem>
            <SelectItem value="past_client">Past Clients</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No contacts found matching your criteria.
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map(contact => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">{contact.client_name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status.replace(/_/g, ' ')}
                      </span>
                      {contact.priority === 'high' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          High Priority
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                      {contact.client_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {contact.client_email}
                        </div>
                      )}
                      {contact.client_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" /> {contact.client_phone}
                        </div>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-sm text-slate-600 mt-3 bg-slate-50 p-2 rounded-md border border-slate-100">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2">
                      <FileText className="w-4 h-4" /> Log Note
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2">
                      <Calendar className="w-4 h-4" /> Follow Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}