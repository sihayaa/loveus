(() => {
  const SUPABASE_URL = "https://tmjozxcjylcxgemffnoc.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtam96eGNqeWxjeGdlbWZmbm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzQxMzIsImV4cCI6MjA2NzY1MDEzMn0.W3VWFN5tiPhkoVzW_iZsYIZAcWn01LL2YfdI8zBowVI";

  // login allowlist (same as yours)
  window.ALLOW = ["gokumeng48@gmail.com", "micdmick@gmail.com"];

  // shared config
  window.ROOM_KEY = "couple";
  window.HAS_SORT_COLUMN = false;

  if (!window.supabase?.createClient) {
    alert("Supabase library not loaded (CDN). Check the <script> tag in <head>.");
    return;
  }

  // create client once
  if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  const sb = window.supabaseClient;

  async function boot() {
    try {
      const { data, error } = await sb.auth.getUser();
      if (error) console.warn("auth.getUser error:", error);

      const user = data?.user || null;

      if (!user) {
        // not logged in -> go login
        window.location.href = "login.html";
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

      // ✅ tell index.html it's safe to init feature scripts now
      window.dispatchEvent(new Event("app:ready"));
    } catch (e) {
      console.error("boot error:", e);
      alert("Supabase boot failed. Open console for details.");
    }
  }

  boot();
})();
