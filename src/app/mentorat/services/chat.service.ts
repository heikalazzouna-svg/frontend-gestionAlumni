import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject, Observable, catchError, of } from 'rxjs';

export interface ChatMessage {
  id?: number;
  content: string;
  sentDate: string;
  sender: { id: number; firstName: string; lastName: string };
  receiver: { id: number; firstName: string; lastName: string };
  attachmentUrl?: string;
  fileName?: string;
  fileType?: string;
  isRead?: boolean;
}

export interface ConversationSummary {
  conversationId: number;
  otherUser: { id: number; firstName: string; lastName: string; avatarUrl?: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  tags: string;
  isGroup: boolean;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private client: Client | null = null;
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/api/messages';

  public messageSubject = new Subject<ChatMessage>();
  public typingSubject = new Subject<{ userId: number; typing: boolean }>();

  private activeConversationId: number | null = null;
  private pendingConversationId: number | null = null;
  private connected = false;

  connect(): void {
    if (!isPlatformBrowser(this.platformId) || this.client?.active) return;

    this.client = new Client({
      brokerURL: `ws://${window.location.host}/ws/websocket`,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected');
        this.connected = true;
        // Subscribe to pending conversation if any
        if (this.pendingConversationId !== null) {
          this.doSubscribe(this.pendingConversationId);
          this.pendingConversationId = null;
        }
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error', event);
      }
    });

    this.client.activate();
  }

  private doSubscribe(conversationId: number): void {
    if (!this.client?.connected) return;
    this.activeConversationId = conversationId;

    this.client.subscribe(`/topic/conversation/${conversationId}`, (msg: IMessage) => {
      this.messageSubject.next(JSON.parse(msg.body));
    });

    this.client.subscribe(`/topic/conversation/${conversationId}/typing`, (msg: IMessage) => {
      this.typingSubject.next(JSON.parse(msg.body));
    });
  }

  subscribeToConversation(conversationId: number): void {
    if (this.connected && this.client?.connected) {
      this.doSubscribe(conversationId);
    } else {
      // Client not connected yet — defer subscription
      this.pendingConversationId = conversationId;
    }
  }

  sendMessage(conversationId: number, message: Record<string, unknown>): void {
    if (this.connected && this.client?.connected) {
      this.client.publish({
        destination: `/app/chat.sendMessage/${conversationId}`,
        body: JSON.stringify(message)
      });
    } else {
      // WebSocket not ready — fall back to REST
      const senderId = (message['sender'] as any)?.id;
      const receiverId = (message['receiver'] as any)?.id;
      const content = message['content'] as string;
      if (senderId && receiverId && content) {
        this.http.post<any>(
          `${this.apiUrl}/send?senderId=${senderId}&receiverId=${receiverId}&content=${encodeURIComponent(content)}`,
          {}
        ).subscribe(saved => {
          // Push to local messages so UI updates
          this.messageSubject.next(saved);
        });
      }
    }
  }

  sendTyping(conversationId: number, userId: number, typing: boolean): void {
    this.client?.publish({
      destination: `/app/chat.typing/${conversationId}`,
      body: JSON.stringify({ userId, typing })
    });
  }

  disconnect(): void {
    this.activeConversationId = null;
    this.client?.deactivate();
  }

  // REST API calls

  getOrCreateConversation(userId1: number, userId2: number): Observable<{ conversationId: number; user1: any; user2: any } | null> {
    return this.http.post<any>(`${this.apiUrl}/conversations/get-or-create?userId1=${userId1}&userId2=${userId2}`, {}).pipe(
      catchError(() => of(null))
    );
  }

  getConversationMessages(conversationId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversation/${conversationId}`).pipe(
      catchError(() => of([]))
    );
  }

  getUserConversations(userId: number): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.apiUrl}/conversations/${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  markAsRead(conversationId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read/${conversationId}?userId=${userId}`, {}).pipe(
      catchError(() => of(undefined))
    );
  }

  getUnreadCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/${userId}`).pipe(
      catchError(() => of({ count: 0 }))
    );
  }

  updateTags(conversationId: number, tags: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/conversations/${conversationId}/tags`, { tags }).pipe(
      catchError(() => of(null))
    );
  }

  uploadFile(file: File): Observable<{ url: string; fileName: string; fileType: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; fileName: string; fileType: string }>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(() => of({ url: '', fileName: '', fileType: '' }))
    );
  }
}
