// js/supabase-init.js
(() => {
  const SUPABASE_URL = "https://tmjozxcjylcxgemffnoc.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtam96eGNqeWxjeGdlbWZmbm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzQxMzIsImV4cCI6MjA2NzY1MDEzMn0.W3VWFN5tiPhkoVzW_iZsYIZAcWn01LL2YfdI8zBowVI";

  // Globals used by your other scripts
  window.ROOM_KEY = window.ROOM_KEY || "couple";
  window.HAS_SORT_COLUMN = !!window.HAS_SORT_COLUMN;

  // keep these so other code doesn't break, but no login is enforced
  window.ALLOW = window.ALLOW || ["gokumeng48@gmail.com", "micdmick@gmail.com"];
  window.CURRENT_USER = null;

  if (window.supabaseClient) return;

  if (!window.supabase?.createClient) {
    console.error("Supabase library not loaded. Put the CDN script before this file.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
