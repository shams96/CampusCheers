export interface User {
  user_id: string;
  school_email: string;
  created_at: Date;
}

export interface School {
  school_id: string;
  name: string;
  district: string;
  state: string;
}

export interface DailyPoll {
  poll_id: string;
  school_id: string;
  question: string;
  options: string[];
  scheduled_for: Date;
  created_at: Date;
}

export interface PollResponse {
  response_id: string;
  poll_id: string;
  responder_id: string;
  chosen_option: string;
  selfie_video_url: string;
  submitted_at: Date;
}

export interface PollResults {
  poll_id: string;
  total_responses: number;
  option_counts: Record<string, number>;
  option_percentages: Record<string, number>;
}

export interface CountdownTimerProps {
  targetTime: Date;
  onExpire: () => void;
  className?: string;
}

export interface PollCardProps {
  poll: DailyPoll;
  onVote: (option: string) => void;
  selectedOption?: string;
  isSubmitting?: boolean;
}

export interface SelfieRecorderProps {
  onRecordingComplete: (videoBlob: Blob) => void;
  onCancel: () => void;
}

export interface ResultsScreenProps {
  results: PollResults;
  poll: DailyPoll;
}

export interface NotificationSettings {
  enabled: boolean;
  prePollReminder: boolean;
  pollLive: boolean;
}

export interface AppState {
  user: User | null;
  currentPoll: DailyPoll | null;
  pollResults: PollResults | null;
  isPollActive: boolean;
  hasVoted: boolean;
  isRecording: boolean;
  notificationSettings: NotificationSettings;
} 