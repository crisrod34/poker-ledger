export interface Player {
  id: string;
  name: string;
  is_regular: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  date: string;
  location: string;
  buy_in_amount: number;
  leader_name: string;
  banker_name: string;
  event_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  player_id: string;
  buy_ins_count: number;
  end_balance: number;
  profit_loss: number;
  payment_verified: boolean;
}

export interface SessionPhoto {
  id: string;
  session_id: string;
  storage_path: string;
  uploaded_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Joined types
export interface SessionWithPlayers extends Session {
  session_players: (SessionPlayer & { players: Player })[];
  session_photos: SessionPhoto[];
  events: Event | null;
}

export interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  is_regular: boolean;
  avatar_url: string | null;
  total_profit_loss: number;
  sessions_played: number;
  avg_profit_loss: number;
  best_session: number;
  worst_session: number;
  win_count: number;
  history: number[]; // P&L per session for sparkline
}
