import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, MessageSquare, MinusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectChat from '@/components/projects/ProjectChat';

/**
 * PersistentChatSidebar
 * Draggable, collapsible chat sidebar that stays visible while user navigates.
 * Can be minimized, expanded, and closed.
 */
export default function PersistentChatSidebar({
  scopeId,
  scopeTitle,
  userEmail,
  userName,
  userType,
  onClose,
}) {
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return; // Don't drag when clicking buttons/inputs
    
    setDragging(true);
    const rect = sidebarRef.current?.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect?.left || 0),
      y: e.clientY - (rect?.top || 0),
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => setDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  return (
    <div
      ref={sidebarRef}
      style={{
        position: 'fixed',
        right: position.x,
        top: position.y,
        width: minimized ? 280 : 380,
        height: minimized ? 50 : 500,
        zIndex: 40,
        transition: dragging ? 'none' : 'all 0.2s ease',
      }}
      className="bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col overflow-hidden"
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 cursor-move hover:from-blue-100 hover:to-blue-200 transition-colors flex-shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {scopeTitle || 'Project Chat'}
            </p>
            <p className="text-xs text-slate-600">Live chat</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMinimized(!minimized)}
            className="h-6 w-6 hover:bg-blue-200"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? (
              <ChevronDown className="w-3 h-3 rotate-180" />
            ) : (
              <MinusIcon className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
            title="Close chat"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {!minimized && (
        <div className="flex-1 overflow-hidden">
          <ProjectChat
            scopeId={scopeId}
            userEmail={userEmail}
            userName={userName}
            userType={userType}
          />
        </div>
      )}
    </div>
  );
}