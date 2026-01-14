(() => {
  const SUPABASE_URL = "https://tmjozxcjylcxgemffnoc.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtam96eGNqeWxjeGdlbWZmbm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzQxMzIsImV4cCI6MjA2NzY1MDEzMn0.W3VWFN5tiPhkoVzW_iZsYIZAcWn01LL2YfdI8zBowVI";


  window.ALLOW = ["gokumeng48@gmail.com", "micdmick@gmail.com"];
  window.ROOM_KEY = "couple";
  window.CURRENT_USER = null;
  window.HAS_SORT_COLUMN = false;

  if (!window.supabaseClient) {
    if (!window.supabase?.createClient) {
      console.error("Supabase library not loaded. Put the CDN script before this file.");
      return;
    }
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  const sb = window.supabaseClient;

  async function boot() {

    const { data: { user } = { user: null }, error } = await sb.auth.getUser();

    if (error) console.warn("auth.getUser error:", error);

    if (!user) {
 
      location.href = "login.html";
      return;
    }

    const email = (user.email || "").toLowerCase();
    if (!window.ALLOW.includes(email)) {
      await sb.auth.signOut();
      document.body.innerHTML =
        "<p style='font:16px system-ui;padding:24px'>Not authorized.</p>";
      return;
    }

    window.CURRENT_USER = user;

    if (typeof window.initReminders === "function") window.initReminders();
    if (typeof window.initQuickChat === "function") window.initQuickChat();
  }

  boot();
})();
