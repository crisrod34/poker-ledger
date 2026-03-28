import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SessionSeed {
  date: string;
  location: string;
  buy_in_amount: number;
  leader_name: string;
  banker_name: string;
  event_name?: string;
  players: { name: string; buy_ins_count: number; end_balance: number }[];
}

const REGULARS = ["Santiago", "Mariano", "Crod", "Joaco", "Moyano", "Nick G.", "Nieva", "Martin"];
const GUESTS = ["Nadeem", "Diego", "Becks", "Choli", "David", "Nico", "Lito", "Nico BR", "Roberto", "Edu", "Vicho"];

const SESSIONS: SessionSeed[] = [
  // 1. 17/04/24 - Chez Crod
  {
    date: "2024-04-17",
    location: "Chez Crod",
    buy_in_amount: 20,
    leader_name: "Crod",
    banker_name: "Crod",
    players: [
      { name: "Nick G.", buy_ins_count: 2, end_balance: 9.75 },
      { name: "Crod", buy_ins_count: 2, end_balance: 12.55 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 39.95 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 36.10 },
      { name: "Diego", buy_ins_count: 1, end_balance: 61.50 },
      { name: "Joaco", buy_ins_count: 1, end_balance: 20.15 },
      { name: "Nadeem", buy_ins_count: 1, end_balance: 0 },
    ],
  },
  // 2. 22/06/24 - Chez Daros
  {
    date: "2024-06-22",
    location: "Chez Daros",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 1, end_balance: 23.70 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 27.10 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 7.55 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 34.55 },
      { name: "Joaco", buy_ins_count: 1, end_balance: 7.10 },
    ],
  },
  // 3. 15/12/24 - Chez Daros (10€ Buy-in)
  {
    date: "2024-12-15",
    location: "Chez Daros",
    buy_in_amount: 10,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 1, end_balance: 8.15 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 22.50 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 4.70 },
      { name: "Nieva", buy_ins_count: 1, end_balance: 4.65 },
    ],
  },
  // 4. 25/01/25 - Chez Nieva
  {
    date: "2025-01-25",
    location: "Chez Nieva",
    buy_in_amount: 20,
    leader_name: "Nieva",
    banker_name: "Nieva",
    players: [
      { name: "Nick G.", buy_ins_count: 1, end_balance: 0 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 45.85 },
      { name: "Santiago", buy_ins_count: 2, end_balance: 28.95 },
      { name: "Nieva", buy_ins_count: 1, end_balance: 23.95 },
      { name: "Becks", buy_ins_count: 2, end_balance: 41.25 },
    ],
  },
  // 5. 04/02/25 - Chez Nieva
  {
    date: "2025-02-04",
    location: "Chez Nieva",
    buy_in_amount: 20,
    leader_name: "Nieva",
    banker_name: "Nieva",
    players: [
      { name: "Nick G.", buy_ins_count: 1, end_balance: 10.20 },
      { name: "Mariano", buy_ins_count: 2, end_balance: 56.85 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 33.20 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 57.50 },
      { name: "Nieva", buy_ins_count: 2, end_balance: 42.25 },
      { name: "Choli", buy_ins_count: 3, end_balance: 0 },
    ],
  },
  // 6. 06/03/25 - Chez Daros
  {
    date: "2025-03-06",
    location: "Chez Daros",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 1, end_balance: 31.50 },
      { name: "Mariano", buy_ins_count: 2, end_balance: 31.95 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 41.45 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 15.10 },
      { name: "Nieva", buy_ins_count: 1, end_balance: 0 },
    ],
  },
  // 7. 13/06/25 - Retiro Poker (Day 1)
  {
    date: "2025-06-13",
    location: "Retiro Poker",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    event_name: "Retiro Poker 2025",
    players: [
      { name: "Nick G.", buy_ins_count: 2, end_balance: 76.50 },
      { name: "Crod", buy_ins_count: 2, end_balance: 4.00 },
      { name: "Mariano", buy_ins_count: 2, end_balance: 34.45 },
      { name: "Santiago", buy_ins_count: 2, end_balance: 0 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 36.65 },
      { name: "Martin", buy_ins_count: 1, end_balance: 23.30 },
      { name: "Nieva", buy_ins_count: 1, end_balance: 45.10 },
    ],
  },
  // 8. 14/06/25 - Retiro Poker (Day 2)
  {
    date: "2025-06-14",
    location: "Retiro Poker",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    event_name: "Retiro Poker 2025",
    players: [
      { name: "Nick G.", buy_ins_count: 1, end_balance: 43.35 },
      { name: "Crod", buy_ins_count: 1, end_balance: 1.10 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 67.40 },
      { name: "Santiago", buy_ins_count: 2, end_balance: 40.00 },
      { name: "Moyano", buy_ins_count: 2, end_balance: 33.50 },
      { name: "Martin", buy_ins_count: 1, end_balance: 19.90 },
      { name: "Nieva", buy_ins_count: 3, end_balance: 14.75 },
    ],
  },
  // 9. 13/09/25 - Chez Mariano
  {
    date: "2025-09-13",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Crod", buy_ins_count: 1, end_balance: 60.47 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 0 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 58.72 },
      { name: "Nico", buy_ins_count: 1, end_balance: 0 },
      { name: "David", buy_ins_count: 2, end_balance: 20.81 },
    ],
  },
  // 10. 20/09/25 - Chez Mariano
  {
    date: "2025-09-20",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 2, end_balance: 0 },
      { name: "Crod", buy_ins_count: 1, end_balance: 50.25 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 34.50 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 57.65 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 16.00 },
      { name: "Lito", buy_ins_count: 2, end_balance: 0 },
      { name: "Nieva", buy_ins_count: 2, end_balance: 61.60 },
      { name: "Martin", buy_ins_count: 1, end_balance: 0 },
    ],
  },
  // 11. 17/10/25 - Chez Mariano
  {
    date: "2025-10-17",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 2, end_balance: 51.00 },
      { name: "Nico BR", buy_ins_count: 1, end_balance: 21.35 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 43.00 },
      { name: "Santiago", buy_ins_count: 2, end_balance: 37.10 },
      { name: "Moyano", buy_ins_count: 2, end_balance: 34.80 },
      { name: "Nieva", buy_ins_count: 1, end_balance: 29.10 },
      { name: "Roberto", buy_ins_count: 2, end_balance: 27.50 },
      { name: "Edu", buy_ins_count: 2, end_balance: 16.15 },
    ],
  },
  // 12. 15/11/25 - Chez Mariano
  {
    date: "2025-11-15",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 3, end_balance: 0 },
      { name: "Edu", buy_ins_count: 1, end_balance: 0 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 25.35 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 96.80 },
      { name: "Moyano", buy_ins_count: 2, end_balance: 34.50 },
      { name: "Martin", buy_ins_count: 1, end_balance: 23.35 },
    ],
  },
  // 13. 19/12/25 - Chez Mariano
  {
    date: "2025-12-19",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Mariano", buy_ins_count: 1, end_balance: 43.00 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 35.50 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 10.20 },
      { name: "Martin", buy_ins_count: 1, end_balance: 3.90 },
      { name: "Nieva", buy_ins_count: 2, end_balance: 27.40 },
    ],
  },
  // 14. 06/02/26 - Chez Mariano
  {
    date: "2026-02-06",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 2, end_balance: 0 },
      { name: "Crod", buy_ins_count: 1, end_balance: 32.00 },
      { name: "Mariano", buy_ins_count: 1, end_balance: 36.00 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 20.50 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 23.35 },
      { name: "Martin", buy_ins_count: 1, end_balance: 28.10 },
    ],
  },
  // 15. 06/03/26 - Chez Mariano
  {
    date: "2026-03-06",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Nick G.", buy_ins_count: 3, end_balance: 17.50 },
      { name: "Crod", buy_ins_count: 2, end_balance: 125.75 },
      { name: "Mariano", buy_ins_count: 2, end_balance: 33.10 },
      { name: "Santiago", buy_ins_count: 3, end_balance: 16.25 },
      { name: "Moyano", buy_ins_count: 1, end_balance: 35.40 },
      { name: "Martin", buy_ins_count: 1, end_balance: 17.70 },
      { name: "Vicho", buy_ins_count: 1, end_balance: 14.30 },
    ],
  },
  // 16. 28/03/26 - Chez Mariano
  {
    date: "2026-03-28",
    location: "Chez Mariano",
    buy_in_amount: 20,
    leader_name: "Mariano",
    banker_name: "Mariano",
    players: [
      { name: "Crod", buy_ins_count: 1, end_balance: 83.25 },
      { name: "Mariano", buy_ins_count: 2, end_balance: 20.50 },
      { name: "Santiago", buy_ins_count: 1, end_balance: 29.25 },
      { name: "Moyano", buy_ins_count: 2, end_balance: 0 },
      { name: "Martin", buy_ins_count: 1, end_balance: 16.00 },
      { name: "Nieva", buy_ins_count: 1, end_balance: 11.00 },
    ],
  },
];

async function seed() {
  console.log("Seeding players...");

  // Upsert all players
  const allPlayers = [
    ...REGULARS.map((name) => ({ name, is_regular: true })),
    ...GUESTS.map((name) => ({ name, is_regular: false })),
  ];

  for (const player of allPlayers) {
    const { error } = await supabase
      .from("players")
      .upsert({ name: player.name, is_regular: player.is_regular }, { onConflict: "name" });
    if (error) console.error(`Error inserting player ${player.name}:`, error.message);
  }

  // Fetch all players to get IDs
  const { data: dbPlayers } = await supabase.from("players").select("id, name");
  if (!dbPlayers) throw new Error("Failed to fetch players");

  const playerIdMap = new Map(dbPlayers.map((p) => [p.name, p.id]));

  // Create events
  console.log("Creating events...");
  // Check if event exists first
  const { data: existingEvent } = await supabase
    .from("events")
    .select("id")
    .eq("name", "Retiro Poker 2025")
    .single();

  let eventId: string | null = existingEvent?.id || null;
  if (!eventId) {
    const { data: newEvent } = await supabase
      .from("events")
      .insert({ name: "Retiro Poker 2025", description: "2-day poker retreat" })
      .select()
      .single();
    eventId = newEvent?.id || null;
  }

  console.log("Seeding sessions...");

  for (const session of SESSIONS) {
    const sessionEventId = session.event_name ? eventId : null;

    // Check if session already exists (by date + location)
    const { data: existing } = await supabase
      .from("sessions")
      .select("id")
      .eq("date", session.date)
      .eq("location", session.location)
      .single();

    if (existing) {
      console.log(`  Skipping ${session.date} - ${session.location} (already exists)`);
      continue;
    }

    const { data: dbSession, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        date: session.date,
        location: session.location,
        buy_in_amount: session.buy_in_amount,
        leader_name: session.leader_name,
        banker_name: session.banker_name,
        event_id: sessionEventId,
      })
      .select()
      .single();

    if (sessionError || !dbSession) {
      console.error(`Error inserting session ${session.date}:`, sessionError?.message);
      continue;
    }

    // Insert player results
    const playerRows = session.players.map((p) => {
      const playerId = playerIdMap.get(p.name);
      if (!playerId) {
        console.error(`  Player not found: ${p.name}`);
      }
      return {
        session_id: dbSession.id,
        player_id: playerId!,
        buy_ins_count: p.buy_ins_count,
        end_balance: p.end_balance,
        profit_loss: p.end_balance - p.buy_ins_count * session.buy_in_amount,
        payment_verified: true, // Historical data = all settled
      };
    }).filter((r) => r.player_id);

    const { error: playersError } = await supabase
      .from("session_players")
      .insert(playerRows);

    if (playersError) {
      console.error(`  Error inserting players for ${session.date}:`, playersError.message);
    } else {
      console.log(`  Seeded: ${session.date} - ${session.location} (${playerRows.length} players)`);
    }
  }

  console.log("\nDone! Verifying...");

  // Verify totals
  const { count: sessionCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true });
  const { count: playerCount } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true });

  console.log(`Sessions: ${sessionCount}`);
  console.log(`Players: ${playerCount}`);

  // Check leaderboard
  const { data: results } = await supabase
    .from("session_players")
    .select("profit_loss, players(name)")
    .order("profit_loss", { ascending: false });

  if (results) {
    const totals = new Map<string, number>();
    for (const r of results) {
      const name = (r.players as unknown as { name: string }).name;
      totals.set(name, (totals.get(name) || 0) + Number(r.profit_loss));
    }

    console.log("\nLeaderboard:");
    [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, total]) => {
        console.log(`  ${name}: ${total >= 0 ? "+" : ""}€${total.toFixed(2)}`);
      });
  }
}

seed().catch(console.error);
