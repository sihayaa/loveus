const SUPABASE_URL = "https://tmjozxcjylcxgemffnoc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtam96eGNqeWxjeGdlbWZmbm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzQxMzIsImV4cCI6MjA2NzY1MDEzMn0.W3VWFN5tiPhkoVzW_iZsYIZAcWn01LL2YfdI8zBowVI";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabaseClient;
window.ALLOW = ["gokumeng48@gmail.com","micdmick@gmail.com"];
window.ROOM_KEY = "couple";
window.CURRENT_USER = null;
window.HAS_SORT_COLUMN = true;

(async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    location.href = "login.html";
    return;
  }

  const email = (user.email || "").toLowerCase();
  if (!window.ALLOW.includes(email)) {
    await supabaseClient.auth.signOut();
    document.body.innerHTML = "<p style='font:16px system-ui;padding:24px'>Not authorized.</p>";
    return;
  }

  window.CURRENT_USER = user;

  try {
    const { error } = await supabaseClient
      .from("reminders")
      .select("id, sort")
      .eq("room_key", window.ROOM_KEY)
      .limit(1);

    if (error && /does not exist/i.test(error.message)) {
      window.HAS_SORT_COLUMN = false;
    }
  } catch {
    window.HAS_SORT_COLUMN = false;
  }

  if (typeof window.initReminders === "function") {
    window.initReminders();
  }

  if (typeof window.initQuickChat === "function") {
    window.initQuickChat();
  }

})();
