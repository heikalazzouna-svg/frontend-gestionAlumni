import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, ChatMessage, ConversationSummary } from '../../services/chat.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../shared/models/user.model';

const EMOJI_LIST = ['😀','😂','😊','😍','🤔','👍','👏','🎉','❤️','🔥','😢','😮','🙏','💪','✅','⭐','📎','🎯','💡','🚀'];

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.css']
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  currentUser: User | null = null;
  conversations = signal<ConversationSummary[]>([]);
  activeConversation = signal<ConversationSummary | null>(null);
  messages = signal<ChatMessage[]>([]);
  newMessage = '';
  loading = signal(true);
  showEmojiPicker = signal(false);
  emojis = EMOJI_LIST;
  typingUser = signal<string | null>(null);
  private typingTimeout: any = null;
  searchQuery = '';
  editingTags = signal(false);
  tagInput = '';
  unreadTotal = signal(0);
  private shouldScroll = true;

  filteredConversations = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.conversations();
    if (!q) return list;
    return list.filter(c =>
      `${c.otherUser.firstName} ${c.otherUser.lastName}`.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      c.tags.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) return;

    this.chatService.connect();
    this.loadConversations();

    // Check if we are navigating to a specific user chat
    const paramSub = this.route.params.subscribe(params => {
      const receiverId = +params['userId'];
      if (receiverId && this.currentUser) {
        this.openConversationWithUser(receiverId);
      }
    });
    this.subscriptions.push(paramSub);

    // Listen for new messages
    const msgSub = this.chatService.messageSubject.subscribe(msg => {
      this.messages.update(msgs => [...msgs, msg]);
      this.shouldScroll = true;
      this.loadConversations(); // refresh sidebar
    });
    this.subscriptions.push(msgSub);

    // Listen for typing indicators
    const typeSub = this.chatService.typingSubject.subscribe(data => {
      if (data.userId !== this.currentUser?.id) {
        if (data.typing) {
          const conv = this.activeConversation();
          if (conv) {
            this.typingUser.set(`${conv.otherUser.firstName}`);
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => this.typingUser.set(null), 3000);
          }
        } else {
          this.typingUser.set(null);
        }
      }
    });
    this.subscriptions.push(typeSub);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    clearTimeout(this.typingTimeout);
    this.chatService.disconnect();
  }

  loadConversations(): void {
    if (!this.currentUser) return;
    this.chatService.getUserConversations(this.currentUser.id).subscribe(convs => {
      this.conversations.set(convs);
      this.loading.set(false);
    });
    this.chatService.getUnreadCount(this.currentUser.id).subscribe(r => {
      this.unreadTotal.set(r.count);
    });
  }

  openConversationWithUser(userId: number): void {
    if (!this.currentUser) return;
    this.chatService.getOrCreateConversation(this.currentUser.id, userId).subscribe(result => {
      if (!result) return;
      this.selectConversation({
        conversationId: result.conversationId,
        otherUser: result.user1.id === this.currentUser!.id ? result.user2 : result.user1,
        lastMessage: '',
        lastMessageAt: '',
        unreadCount: 0,
        tags: '',
        isGroup: false,
        name: ''
      });
    });
  }

  selectConversation(conv: ConversationSummary): void {
    this.activeConversation.set(conv);
    this.showEmojiPicker.set(false);
    this.editingTags.set(false);
    this.messages.set([]);

    // Load history
    this.chatService.getConversationMessages(conv.conversationId).subscribe(msgs => {
      this.messages.set(msgs);
      this.shouldScroll = true;
    });

    // Subscribe to live messages
    this.chatService.subscribeToConversation(conv.conversationId);

    // Mark as read
    if (this.currentUser && conv.unreadCount > 0) {
      this.chatService.markAsRead(conv.conversationId, this.currentUser.id).subscribe(() => {
        this.loadConversations();
      });
    }
  }

  sendMessage(): void {
    const conv = this.activeConversation();
    if (!this.newMessage.trim() || !this.currentUser || !conv) return;

    const message = {
      content: this.newMessage,
      sender: { id: this.currentUser.id },
      receiver: { id: conv.otherUser.id }
    };

    this.chatService.sendMessage(conv.conversationId, message);
    this.newMessage = '';
    this.showEmojiPicker.set(false);

    // Stop typing indicator
    this.chatService.sendTyping(conv.conversationId, this.currentUser.id, false);
  }

  onTyping(): void {
    const conv = this.activeConversation();
    if (!this.currentUser || !conv) return;
    this.chatService.sendTyping(conv.conversationId, this.currentUser.id, true);
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      if (this.currentUser && conv) {
        this.chatService.sendTyping(conv.conversationId, this.currentUser.id, false);
      }
    }, 2000);
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker.update(v => !v);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.currentUser || !this.activeConversation()) return;

    const file = input.files[0];
    const conv = this.activeConversation()!;

    this.chatService.uploadFile(file).subscribe(result => {
      if (!result.url) return;

      const message = {
        content: `📎 ${result.fileName}`,
        sender: { id: this.currentUser!.id },
        receiver: { id: conv.otherUser.id },
        attachmentUrl: result.url,
        fileName: result.fileName,
        fileType: result.fileType
      };
      this.chatService.sendMessage(conv.conversationId, message);
    });

    input.value = '';
  }

  startEditTags(): void {
    const conv = this.activeConversation();
    this.tagInput = conv?.tags || '';
    this.editingTags.set(true);
  }

  saveTags(): void {
    const conv = this.activeConversation();
    if (!conv) return;
    this.chatService.updateTags(conv.conversationId, this.tagInput).subscribe(() => {
      this.editingTags.set(false);
      this.loadConversations();
    });
  }

  getInitials(user: { firstName: string; lastName: string }): string {
    return ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase();
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch { /* noop */ }
  }
}
