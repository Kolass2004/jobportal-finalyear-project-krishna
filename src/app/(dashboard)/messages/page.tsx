'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, MessageSquare, Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConvo) fetchMessages(activeConvo);
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    const res = await fetch('/api/messages');
    const data = await res.json();
    setConversations(data);
    setLoading(false);
  };

  const fetchMessages = async (convoId: string) => {
    const res = await fetch(`/api/messages/${convoId}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo) return;
    const res = await fetch(`/api/messages/${activeConvo}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      fetchConversations();
    }
  };

  const startNewChat = async (userId: string) => {
    const res = await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: userId }),
    });
    if (res.ok) {
      const data = await res.json();
      setActiveConvo(data.conversationId);
      setShowNewChat(false);
      fetchConversations();
    }
  };

  const getOtherUser = (convo: any) => {
    return convo.participants?.find((p: any) => p.userId !== session?.user?.id)?.user;
  };

  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  // Fetch users for new chat
  useEffect(() => {
    if (showNewChat) {
      fetch('/api/users/search?q=' + searchUser).then(r => r.json()).then(setUsers).catch(() => setUsers([]));
    }
  }, [showNewChat, searchUser]);

  return (
    <div className="flex h-[calc(100vh-80px)] -m-6 md:-m-8">
      {/* Conversations List */}
      <div className="w-[320px] border-r border-notion-border flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-notion-border flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-notion-text">Messages</h2>
          <button onClick={() => setShowNewChat(!showNewChat)} className="p-1.5 rounded-md hover:bg-notion-bg-hover text-notion-text-secondary">
            <Plus size={18} />
          </button>
        </div>

        {showNewChat && (
          <div className="p-3 border-b border-notion-border bg-notion-bg-secondary">
            <input
              value={searchUser} onChange={e => setSearchUser(e.target.value)}
              className="notion-input text-xs" placeholder="Search users..."
            />
            <div className="mt-2 max-h-[200px] overflow-y-auto">
              {users.map((u: any) => (
                <button key={u.id} onClick={() => startNewChat(u.id)} className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-notion-bg-hover text-left">
                  <div className="w-7 h-7 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-[10px] font-semibold">{initials(u.name)}</div>
                  <div>
                    <div className="text-xs font-medium text-notion-text">{u.name}</div>
                    <div className="text-[10px] text-notion-text-tertiary">{u.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => {
            const other = getOtherUser(convo);
            const lastMsg = convo.messages?.[0];
            return (
              <button
                key={convo.id}
                onClick={() => setActiveConvo(convo.id)}
                className={`flex items-center gap-3 w-full p-3 px-5 text-left border-b border-notion-border-light transition-colors ${activeConvo === convo.id ? 'bg-notion-bg-active' : 'hover:bg-notion-bg-hover'}`}
              >
                <div className="w-9 h-9 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {initials(other?.name || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-notion-text truncate">{other?.name}</div>
                  <div className="text-xs text-notion-text-tertiary truncate">{lastMsg?.content || 'No messages yet'}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-notion-text-tertiary">
                    {lastMsg?.createdAt ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false }) : ''}
                  </span>
                  {convo.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-notion-blue text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {!loading && conversations.length === 0 && (
            <div className="text-center py-12 text-notion-text-tertiary">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeConvo ? (
        <div className="flex-1 flex flex-col">
          <div className="p-3 px-5 border-b border-notion-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-xs font-semibold">
              {initials(getOtherUser(conversations.find(c => c.id === activeConvo))?.name || '')}
            </div>
            <span className="font-medium text-sm text-notion-text">
              {getOtherUser(conversations.find(c => c.id === activeConvo))?.name}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`max-w-[70%] ${msg.senderId === session?.user?.id ? 'self-end' : 'self-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.senderId === session?.user?.id
                    ? 'bg-notion-blue text-white rounded-br-sm'
                    : 'bg-notion-bg-tertiary text-notion-text rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <div className={`text-[10px] mt-1 ${msg.senderId === session?.user?.id ? 'text-right' : 'text-left'} text-notion-text-tertiary`}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-notion-border flex gap-3 items-end">
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              className="flex-1 border border-notion-border rounded-xl px-4 py-2.5 bg-notion-bg text-notion-text text-sm outline-none resize-none min-h-[40px] max-h-[120px] focus:border-notion-blue"
              placeholder="Type a message..."
              rows={1}
            />
            <button onClick={sendMessage} disabled={!newMessage.trim()} className="btn-primary p-2.5 rounded-xl">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-notion-text-tertiary gap-3">
          <MessageSquare size={40} className="opacity-30" />
          <p className="text-sm">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
