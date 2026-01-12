(() => {
  const SUPABASE_URL = "https://tmjozxcjylcxgemffnoc.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtam96eGNqeWxjeGdlbWZmbm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzQxMzIsImV4cCI6MjA2NzY1MDEzMn0.W3VWFN5tiPhkoVzW_iZsYIZAcWn01LL2YfdI8zBowVI";

  if (window.supabaseClient) return;

  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase library not loaded. Make sure CDN script is included first.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.ALLOW = ["gokumeng48@gmail.com", "micdmick@gmail.com"];
  window.ROOM_KEY = "couple";
  window.CURRENT_USER = null;

  // for now, don’t use DB sort column (no 400 error)
  window.HAS_SORT_COLUMN = false;

  // optional auth gate (only if the page wants it)
  window.ensureAuth = async function ensureAuth(redirectTo = "login.html") {
    const sb = window.supabaseClient;
    const { data: { user } = { user: null } } = await sb.auth.getUser();

    if (!user) {
      location.href = redirectTo;
      return null;
    }

    const email = (user.email || "").toLowerCase();
    if (!window.ALLOW.includes(email)) {
      await sb.auth.signOut();
      document.body.innerHTML =
        "<p style='font:16px system-ui;padding:24px'>Not authorized.</p>";
      return null;
    }

    window.CURRENT_USER = user;
    return user;
  };
})();
