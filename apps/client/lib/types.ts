export interface NotificationItem {
  id: string;
  text: string;
  read: boolean;
  ticketId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  language?: string;
  avatar?: string;
  isAdmin: boolean;
  external_user?: boolean;
  firstLogin?: boolean;
  ticket_created?: boolean;
  ticket_status_changed?: boolean;
  ticket_assigned?: boolean;
  ticket_comments?: boolean;
  notifcations: NotificationItem[];
}

export interface TicketAssignee {
  id: string;
  name: string;
}

export interface TicketCommentUser {
  id: string;
  name: string;
}

export interface TicketComment {
  id: string;
  text: string;
  public?: boolean;
  createdAt: string;
  user: TicketCommentUser;
}

export interface Ticket {
  id: string;
  Number?: number;
  title: string;
  type?: string;
  priority?: string;
  status?: string;
  isComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
  email?: string;
  fromImap?: boolean;
  note?: string;
  detail?: string;
  assignedTo?: TicketAssignee | null;
  comments?: TicketComment[];
  TimeTracking?: Array<{
    id: string;
    time: number;
    user: TicketCommentUser;
  }>;
  client?: {
    id: string;
    name: string;
  } | null;
}

export interface SessionRecord {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expires: string;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  flagKey: string;
}

export interface Notebook {
  id: string;
  title: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}
