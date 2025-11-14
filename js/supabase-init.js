// js/supabase-init.js

const SUPABASE_URL = "https://tmjozxcjylcxgemffnoc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtam96eGNqeWxjeGdlbWZmbm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzQxMzIsImV4cCI6MjA2NzY1MDEzMn0.W3VWFN5tiPhkoVzW_iZsYIZAcWn01LL2YfdI8zBowVI";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabaseClient;
window.ALLOW = ["gokumeng48@gmail.com", "micdmick@gmail.com"];
window.ROOM_KEY = "couple";
window.CURRENT_USER = null;

// for now, don’t use DB sort column (no 400 error)
window.HAS_SORT_COLUMN = false;

(async () => {
  const { data: { user } = { user: null } } = await supabaseClient.auth.getUser();

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

  // if we ever decide to use a real DB sort column, we can add the check back here

  if (typeof window.initReminders === "function") {
    window.initReminders();
  }

  if (typeof window.initQuickChat === "function") {
    window.initQuickChat();
  }
})();
