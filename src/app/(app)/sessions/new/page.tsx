import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { SessionForm } from "@/components/sessions/session-form";

export default async function NewSessionPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("id, name, is_regular")
    .order("name");

  const { data: events } = await supabase
    .from("events")
    .select("id, name")
    .order("name");

  return (
    <>
      <PageHeader title="New Session" subtitle="Log a new poker night" />
      <SessionForm players={players || []} events={events || []} />
    </>
  );
}
