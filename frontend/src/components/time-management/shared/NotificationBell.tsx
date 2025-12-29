'use client';
import React, { useEffect, useRef, useState } from 'react';
import timeManagementService from '@/services/timeManagementService';
import { useToast } from '@/hooks/use-toast';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const prevCountRef = useRef<number>(0);

  async function fetchNotifications() {
    try {
      const data = await timeManagementService.getNotificationLogs({});
      setNotifications(data || []);
      const unread = (data || []).filter((n:any)=>!n.read).length;
      if (prevCountRef.current && unread > prevCountRef.current) {
        // new notifications arrived
        toast({ title: 'New notifications', description: `You have ${unread} unread notifications` });
      }
      prevCountRef.current = unread;
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return ()=>clearInterval(id);
  }, []);

  async function markRead(id: string) {
    try {
      await timeManagementService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n=> n._id === id ? { ...n, read: true } : n));
      prevCountRef.current = Math.max(0, prevCountRef.current-1);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to mark read', variant: 'destructive' });
    }
  }

  const unreadCount = notifications.filter(n=>!n.read).length;

  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="relative p-1.5">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">{unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-medium">Notifications</div>
            <button className="text-sm text-blue-600" onClick={()=>{ setNotifications([]); prevCountRef.current = 0; }}>Clear</button>
          </div>
          <div className="max-h-72 overflow-auto">
            {notifications.length === 0 && <div className="p-3 text-sm text-gray-600">No notifications</div>}
            {notifications.map(n => (
              <div key={n._id} className={`p-3 border-b ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="text-sm">{n.message || n.title || n.type}</div>
                <div className="text-xs text-gray-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                {!n.read && <div className="mt-2"><button className="btn" onClick={()=>markRead(n._id)}>Mark read</button></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
