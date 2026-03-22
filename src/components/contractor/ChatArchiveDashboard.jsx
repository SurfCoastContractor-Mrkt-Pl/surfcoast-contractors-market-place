import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Search, Archive, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatArchiveDashboard({ contractorEmail }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('active');
  const [expandedScopeId, setExpandedScopeId] = useState(null);

  const { data: scopes = [] } = useQuery({
    queryKey: ['scopesWithChat', contractorEmail],
    queryFn: () => base44.entities.ScopeOfWork.filter({ contractor_email: contractorEmail }),
    enabled: !!contractorEmail
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['projectMessages', contractorEmail],
    queryFn: () => base44.entities.ProjectMessage.filter({ sender_email: contractorEmail }, '-created_at'),
    enabled: !!contractorEmail
  });

  const scopeChats = useMemo(() => {
    return scopes.map(scope => {
      const scopeMessages = messages.filter(m => m.scope_id === scope.id);
      const unreadCount = scopeMessages.filter(m => !m.read).length;
      const lastMessage = scopeMessages[0];

      return {
        scope,
        messages: scopeMessages,
        messageCount: scopeMessages.length,
        unreadCount,
        lastMessage,
        lastMessageTime: lastMessage?.created_at
      };
    }).sort((a, b) => {
      // Sort by last message time, with unread first
      if ((a.unreadCount > 0) !== (b.unreadCount > 0)) {
        return b.unreadCount > 0 ? 1 : -1;
      }
      return new Date(b.lastMessageTime || b.scope.created_at) - new Date(a.lastMessageTime || a.scope.created_at);
    });
  }, [scopes, messages]);

  const filtered = useMemo(() => {
    let result = scopeChats;

    if (filter === 'active') {
      result = result.filter(c => c.scope.status === 'approved');
    } else if (filter === 'unread') {
      result = result.filter(c => c.unreadCount > 0);
    } else if (filter === 'closed') {
      result = result.filter(c => c.scope.status === 'closed');
    }

    if (searchTerm) {
      result = result.filter(c =>
        c.scope.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.scope.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [scopeChats, filter, searchTerm]);

  const stats = {
    total: scopeChats.length,
    active: scopeChats.filter(c => c.scope.status === 'approved').length,
    unread: scopeChats.filter(c => c.unreadCount > 0).length,
    closed: scopeChats.filter(c => c.scope.status === 'closed').length,
    totalMessages: messages.length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-slate-900">{stats.total}</div>
          <p className="text-xs text-slate-600">Projects</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-blue-600">{stats.active}</div>
          <p className="text-xs text-slate-600">Active</p>
        </Card>
        <Card className="p-3 text-center bg-amber-50">
          <div className="text-lg font-bold text-amber-600">{stats.unread}</div>
          <p className="text-xs text-slate-600">Unread</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-slate-600">{stats.closed}</div>
          <p className="text-xs text-slate-600">Closed</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-slate-900">{stats.totalMessages}</div>
          <p className="text-xs text-slate-600">Messages</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by project or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <TabsList className="w-full">
          <TabsTrigger value="active" onClick={() => setFilter('active')}>
            Active ({stats.active})
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
            Unread ({stats.unread})
          </TabsTrigger>
          <TabsTrigger value="closed" onClick={() => setFilter('closed')}>
            Closed ({stats.closed})
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Chat List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No conversations found</p>
          </Card>
        ) : (
          filtered.map(chat => (
            <Card
              key={chat.scope.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-all border-l-4 ${
                chat.unreadCount > 0
                  ? 'bg-blue-50 border-l-blue-500'
                  : chat.scope.status === 'closed'
                  ? 'bg-slate-50 border-l-slate-300'
                  : 'border-l-green-500'
              }`}
              onClick={() => setExpandedScopeId(expandedScopeId === chat.scope.id ? null : chat.scope.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 truncate">{chat.scope.job_title}</h4>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-xs">{chat.unreadCount} unread</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Customer: {chat.scope.customer_name}</p>

                  {chat.lastMessage && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                      {chat.lastMessage.sender_type === 'contractor' ? 'You: ' : ''}
                      {chat.lastMessage.message}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        chat.scope.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : chat.scope.status === 'closed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {chat.scope.status}
                    </Badge>
                    {chat.lastMessage && (
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(chat.lastMessage.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <Eye className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>

              {/* Expanded Messages */}
              {expandedScopeId === chat.scope.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 max-h-48 overflow-y-auto">
                  {chat.messages.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
                  ) : (
                    chat.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-sm ${
                          msg.sender_type === 'contractor'
                            ? 'bg-blue-100 text-blue-900 ml-6'
                            : 'bg-slate-100 text-slate-900 mr-6'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}