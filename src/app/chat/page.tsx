'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  findOrCreateConversation, 
  sendMessage, 
  subscribeToMessages, 
  subscribeToConversations 
} from '@/lib/messaging';
import { Conversation, Message, Listing, User } from '@/types';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationUsers, setConversationUsers] = useState<Record<string, User>>({});
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [listing, setListing] = useState<Listing | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Check if we need to create a conversation from URL params
    const listingId = searchParams.get('listingId');
    const sellerId = searchParams.get('sellerId');

    if (listingId && sellerId && sellerId !== user.id) {
      initializeConversation(listingId, sellerId);
    } else {
      loadConversations();
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      loadConversationData();
      const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
        setMessages(msgs);
        scrollToBottom();
      });
      return unsubscribe;
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async (listingId: string, sellerId: string) => {
    if (!user) return;
    
    try {
      const conversationId = await findOrCreateConversation(listingId, sellerId, user.id);
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      
      if (conversationDoc.exists()) {
        const data = conversationDoc.data();
        const conv: Conversation = {
          id: conversationDoc.id,
          participants: data.participants || [],
          listingId: data.listingId,
          lastMessage: data.lastMessage,
          lastSenderId: data.lastSenderId,
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        setSelectedConversation(conv);
        loadConversations();
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const loadConversations = () => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.id, async (convs) => {
      setConversations(convs);
      setLoading(false);

      // Load user data for each conversation
      const usersMap: Record<string, User> = {};
      for (const conv of convs) {
        const otherUserId = conv.participants.find(id => id !== user.id);
        if (otherUserId && !usersMap[otherUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              const data = userDoc.data();
              usersMap[otherUserId] = {
                id: userDoc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
              } as User;
            }
          } catch (error) {
            console.error('Error loading user:', error);
          }
        }
      }
      setConversationUsers(usersMap);

      // Auto-select if only one conversation or if coming from listing
      if (convs.length > 0 && !selectedConversation) {
        const listingId = searchParams.get('listingId');
        const matchingConv = listingId 
          ? convs.find(c => c.listingId === listingId)
          : convs[0];
        if (matchingConv) {
          setSelectedConversation(matchingConv);
        }
      }
    });

    return unsubscribe;
  };

  const loadConversationData = async () => {
    if (!selectedConversation || !user) return;

    try {
      // Load listing
      const listingDoc = await getDoc(doc(db, 'listings', selectedConversation.listingId));
      if (listingDoc.exists()) {
        const data = listingDoc.data();
        setListing({
          id: listingDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Listing);
      }

      // Load other user
      const otherUserId = selectedConversation.participants.find(id => id !== user.id);
      if (otherUserId) {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setOtherUser({
            id: userDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as User);
        }
      }
    } catch (error) {
      console.error('Error loading conversation data:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user || sending) return;

    setSending(true);
    try {
      await sendMessage(selectedConversation.id, user.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your messages.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-csuf-orange text-white px-6 py-2 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-csuf-blue mb-8">Messages</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-csuf-orange animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <p className="text-sm text-center">No conversations yet</p>
                </div>
              ) : (
                <div>
                  {conversations.map((conv) => {
                    const otherUserId = conv.participants.find(id => id !== user.id);
                    const convUser = otherUserId ? conversationUsers[otherUserId] : null;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-csuf-orange/5 border-l-4 border-l-csuf-orange' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {convUser?.displayName || 'User'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {conv.lastMessage || 'No messages yet'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    {otherUser?.photoURL ? (
                      <Image
                        src={otherUser.photoURL}
                        alt={otherUser.displayName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-csuf-blue rounded-full flex items-center justify-center text-white font-semibold">
                        {otherUser?.displayName.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{otherUser?.displayName || 'User'}</div>
                      {listing && (
                        <div className="text-sm text-gray-500">About: {listing.title}</div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderId === user.id;
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-csuf-orange text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-orange-100' : 'text-gray-500'}`}>
                              {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-csuf-orange focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-csuf-orange text-white px-6 py-2 rounded-xl font-semibold hover:bg-csuf-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
