import type { SupabaseClient } from "@supabase/supabase-js";

type BasicProfile = {
  id: string;
  username: string;
  name: string | null;
  avatar_url?: string | null;
};

export async function fetchProfileMap(
  supabase: SupabaseClient,
  userIds: Array<string | null | undefined>
) {
  const uniqueIds = Array.from(
    new Set(userIds.filter((id): id is string => Boolean(id)))
  );

  if (uniqueIds.length === 0) {
    return new Map<string, BasicProfile>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, avatar_url")
    .in("id", uniqueIds);

  if (error || !data) {
    console.error("Error fetching profiles for tweets:", error);
    return new Map<string, BasicProfile>();
  }

  return new Map<string, BasicProfile>(
    data.map((profile) => [profile.id, profile as BasicProfile])
  );
}
