import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Send, Users } from 'lucide-react';
import { TimeSlot, Message } from '../types';
import { format } from 'date-fns';
import { formatTimeRange } from '../utils/timeFormat';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeSlot: TimeSlot;
  messages: Message[];
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (message: string) => void;
}

export function ChatDialog({
  open,
  onOpenChange,
  timeSlot,
  messages,
  currentUserId,
  currentUserName,
  onSendMessage,
}: ChatDialogProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {timeSlot.sport} - Chat
          </DialogTitle>
          <DialogDescription>
            {format(new Date(timeSlot.date + 'T00:00:00'), 'EEEE, MMMM d')} • {formatTimeRange(timeSlot.startTime, timeSlot.endTime)}
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Participants ({timeSlot.currentParticipants}/{timeSlot.capacity})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeSlot.participants.map((participant) => (
              <Badge key={participant.id} variant="secondary" className="text-xs">
                {participant.name}
              </Badge>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.userId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(message.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium">{message.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.timestamp), 'h:mm a')}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[80%] ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="flex gap-2 mt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}