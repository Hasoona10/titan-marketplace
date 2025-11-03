'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
  };
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
  };
  unreadCount: number;
  messages?: Message[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv1',
        listing: {
          id: 'listing1',
          title: 'MacBook Pro 13" 2020',
          price: 1200,
        },
        otherUser: {
          id: 'user2',
          name: 'John Doe',
          email: 'john.doe@csu.fullerton.edu',
        },
        lastMessage: {
          content: 'Is the MacBook still available?',
          timestamp: new Date('2024-01-15T10:30:00'),
        },
        unreadCount: 0,
      },
      {
        id: 'conv2',
        listing: {
          id: 'listing2',
          title: 'Calculus Textbook - Stewart',
          price: 80,
        },
        otherUser: {
          id: 'user3',
          name: 'Jane Smith',
          email: 'jane.smith@csu.fullerton.edu',
        },
        lastMessage: {
          content: 'Thanks for the textbook!',
          timestamp: new Date('2024-01-14T15:45:00'),
        },
        unreadCount: 1,
      },
    ];

    const mockMessages: Message[] = [
      {
        id: 'msg1',
        content: 'Hi! Is the MacBook still available?',
        senderId: 'user2',
        timestamp: new Date('2024-01-15T10:30:00'),
      },
      {
        id: 'msg2',
        content: 'Yes, it is! Are you interested?',
        senderId: user?.id || 'current-user',
        timestamp: new Date('2024-01-15T10:35:00'),
      },
      {
        id: 'msg3',
        content: 'What condition is it in?',
        senderId: 'user2',
        timestamp: new Date('2024-01-15T10:40:00'),
      },
    ];

    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setSelectedConversation({
        ...mockConversations[0],
        messages: mockMessages,
      });
    }
  }, [user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // TODO: Implement actual message sending with Firebase
    console.log('Sending message:', { content: newMessage, conversationId: selectedConversation.id });
    
    setNewMessage('');
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
          <p className="text-gray-600">You need to be signed in to view your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td>
            <h1>💬 Messages</h1>
            <p><strong>Chat with other CSUF students about marketplace items</strong></p>
            <hr />
          </td>
        </tr>
        
        <tr>
          <td>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td width="40%" valign="top">
                  <h2>📋 Conversations</h2>
                  {conversations.length === 0 ? (
                    <p><em>No conversations yet</em></p>
                  ) : (
                    <table width="100%" cellPadding="5" cellSpacing="0">
                      {conversations.map((conversation) => (
                        <tr 
                          key={conversation.id}
                          className="listing-item"
                          onClick={() => setSelectedConversation(conversation)}
                          style={{cursor: 'pointer'}}
                        >
                          <td>
                            <strong>{conversation.listing.title}</strong><br />
                            <small>with {conversation.otherUser.name}</small><br />
                            <small>{conversation.lastMessage.content}</small>
                            {conversation.unreadCount > 0 && (
                              <span style={{color: '#cc0000'}}> ({conversation.unreadCount} unread)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </table>
                  )}
                </td>
                
                <td width="60%" valign="top">
                  {selectedConversation ? (
                    <div>
                      <h2>💬 Chat with {selectedConversation.otherUser.name}</h2>
                      <p><strong>About:</strong> {selectedConversation.listing.title}</p>
                      
                      <div>
                        <button onClick={() => router.push('/report-content')}>⚠️ Report</button>
                      </div>
                      
                      <hr />
                      
                      <h3>📝 Messages:</h3>
                      <div style={{height: '300px', overflow: 'auto', border: '1px solid #cccccc', padding: '10px'}}>
                        {selectedConversation.messages?.map((message: Message) => (
                          <div key={message.id} style={{marginBottom: '10px'}}>
                            <strong>{message.senderId === user.id ? 'You' : selectedConversation.otherUser.name}:</strong><br />
                            {message.content}<br />
                            <small style={{color: '#666666'}}>{message.timestamp.toLocaleTimeString()}</small>
                          </div>
                        ))}
                      </div>
                      
                      <hr />
                      
                      <form onSubmit={handleSendMessage}>
                        <table width="100%" cellPadding="5" cellSpacing="0">
                          <tr>
                            <td width="80%">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                size="40"
                              />
                            </td>
                            <td width="20%">
                              <button type="submit">📤 Send</button>
                            </td>
                          </tr>
                        </table>
                      </form>
                    </div>
                  ) : (
                    <div>
                      <h2>💬 Select a Conversation</h2>
                      <p><em>Choose a conversation from the list to start messaging</em></p>
                    </div>
                  )}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td>
            <hr />
            <p align="center">
              <small>© 2024 Titan Marketplace | Page last updated: {new Date().toLocaleDateString()}</small>
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
}
