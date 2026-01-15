window.initQuickChat = function () {
  const supabaseClient = window.supabaseClient;
  const ROOM_KEY = window.ROOM_KEY || "couple";

  if (!supabaseClient) {
    console.warn("Quick chat: supabaseClient not ready");
    return;
  }

  const shell = document.getElementById("quick-chat-shell");
  if (!shell) return;

  // guard
  if (shell.dataset.quickChatInitialized === "1") return;
  shell.dataset.quickChatInitialized = "1";

  const messagesEl  = document.getElementById("quick-messages");
  const formEl      = document.getElementById("quick-message-form");
  const inputEl     = document.getElementById("quick-message-input");
  const sendBtn     = document.getElementById("quick-send-btn");

  const btnGodbrand = document.getElementById("quick-btn-godbrand");
  const btnSihaya   = document.getElementById("quick-btn-sihaya");
  const switchTrack = document.getElementById("quick-sender-switch-track");
  const switchThumb = document.getElementById("quick-sender-switch-thumb");

  if (!messagesEl || !formEl || !inputEl || !sendBtn) {
    console.warn("Quick chat: missing DOM elements");
    return;
  }

  // remember sender per device
  const SENDER_KEY = "quickChatSender";
  let sender = localStorage.getItem(SENDER_KEY) || "sihaya";

  function applySenderUI() {
    if (!btnGodbrand || !btnSihaya || !switchThumb) return;
    if (sender === "sihaya") {
      btnSihaya.classList.add("active");
      btnGodbrand.classList.remove("active");
      switchThumb.style.transform = "translateX(0)";
    } else {
      btnGodbrand.classList.add("active");
      btnSihaya.classList.remove("active");
      switchThumb.style.transform = "translateX(20px)";
    }
  }

  function setSender(s) {
    sender = (s === "godbrand") ? "godbrand" : "sihaya";
    localStorage.setItem(SENDER_KEY, sender);
    applySenderUI();
    renderMessages();
  }

  if (btnSihaya) btnSihaya.addEventListener("click", () => setSender("sihaya"));
  if (btnGodbrand) btnGodbrand.addEventListener("click", () => setSender("godbrand"));
  if (switchTrack) switchTrack.addEventListener("click", () => setSender(sender === "sihaya" ? "godbrand" : "sihaya"));
  applySenderUI();

  let messages = [];

  async function loadMessages() {
    const { data, error } = await supabaseClient
      .from("quick_chat")
      .select("id, sender, text, created_at")
      .eq("room_key", ROOM_KEY)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Quick chat load error:", error);
      messagesEl.innerHTML = `<div class="quick-empty-state">couldn’t load notes 💧</div>`;
      return;
    }

    messages = data || [];
    renderMessages();
  }

  function renderMessages() {
    messagesEl.innerHTML = "";

    if (!messages.length) {
      messagesEl.innerHTML = `<div class="quick-empty-state">no little notes yet — leave one for each other? 💫</div>`;
      return;
    }

    for (const msg of messages) {
      const row = document.createElement("div");
      row.className = "quick-message-row sender-" + (msg.sender === "godbrand" ? "godbrand" : "sihaya");

      // POV alignment (same as your old behavior)
      row.classList.add(msg.sender === sender ? "mine" : "theirs");

      const bubble = document.createElement("div");
      bubble.className = "quick-message-bubble";
      bubble.textContent = msg.text || "";

      row.appendChild(bubble);
      messagesEl.appendChild(row);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (inputEl.value || "").trim();
    if (!text) return;

    sendBtn.disabled = true;

    const { error } = await supabaseClient
      .from("quick_chat")
      .insert({ room_key: ROOM_KEY, sender, text });

    sendBtn.disabled = false;

    if (error) {
      console.warn("Quick chat insert error:", error);
      alert("Send failed: " + error.message);
      return;
    }

    inputEl.value = "";
    loadMessages();
  });

  // realtime refresh
  supabaseClient
    .channel("quick-chat-feed-" + ROOM_KEY)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quick_chat", filter: `room_key=eq.${ROOM_KEY}` },
      () => loadMessages()
    )
    .subscribe();

  loadMessages();
};
