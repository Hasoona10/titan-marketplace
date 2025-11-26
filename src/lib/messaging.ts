import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Conversation, Message } from '@/types';

export async function findOrCreateConversation(
  listingId: string,
  sellerId: string,
  buyerId: string
): Promise<string> {
  // Check if conversation already exists
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('listingId', '==', listingId),
    where('participants', 'array-contains', buyerId)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  // Create new conversation
  const conversationData = {
    participants: [buyerId, sellerId],
    listingId,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(conversationsRef, conversationData);
  return docRef.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  
  await addDoc(messagesRef, {
    senderId,
    text,
    readBy: [senderId],
    createdAt: serverTimestamp(),
  });

  // Update conversation last message
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text,
    lastSenderId: senderId,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        conversationId,
        senderId: data.senderId,
        text: data.text,
        readBy: data.readBy || [],
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    callback(messages);
  });
}

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const conversations: Conversation[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      conversations.push({
        id: docSnap.id,
        participants: data.participants || [],
        listingId: data.listingId,
        lastMessage: data.lastMessage,
        lastSenderId: data.lastSenderId,
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    }
    callback(conversations);
  });
}

