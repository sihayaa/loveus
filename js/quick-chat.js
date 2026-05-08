window.initQuickChat = function () {
  const supabaseClient = window.supabaseClient;
  const ROOM_KEY = window.ROOM_KEY || "couple";

  if (!supabaseClient) {
    console.warn("Quick chat: supabaseClient not ready");
    return;
  }

  const shell = document.getElementById("quick-chat-shell");
  if (!shell) return;

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
  const masterEditBtn = document.getElementById("quick-master-edit-btn");

  if (!messagesEl || !formEl || !inputEl || !sendBtn) {
    console.warn("Quick chat: missing DOM elements");
    return;
  }

  const SENDER_KEY = "quickChatSender";
  let sender = localStorage.getItem(SENDER_KEY) || "sihaya";
  let editMode = false;

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

  // edit mode toggle
  if (masterEditBtn) {
    masterEditBtn.addEventListener("click", () => {
      editMode = !editMode;
      shell.classList.toggle("edit-mode", editMode);
      masterEditBtn.classList.toggle("active", editMode);
      renderMessages();
    });
  }

  let messages = [];

  async function loadMessages() {
    const { data, error } = await supabaseClient
      .from("quick_chat")
      .select("id, sender, text, created_at")
      .eq("room_key", ROOM_KEY)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Quick chat load error:", error);
      messagesEl.innerHTML = `<div class="quick-empty-state">couldn't load notes 💧</div>`;
      return;
    }

    messages = data || [];
    renderMessages();
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;

    return date.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }

  // open inline edit for a message
  function openEditModal(msg) {
    const existing = document.getElementById("quick-inline-editor");
    if (existing) existing.remove();

    const editor = document.createElement("div");
    editor.id = "quick-inline-editor";
    editor.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.6);
      display:grid; place-items:center; z-index:10000;
    `;

    editor.innerHTML = `
      <div style="
        width:min(92vw,480px);
        background:#111;
        border:1px solid #7a5af8;
        border-radius:16px;
        padding:20px;
        box-shadow:0 20px 60px rgba(0,0,0,.5);
      ">
        <p style="color:#fff;font-weight:700;margin:0 0 10px;font-family:'Patrick Hand',cursive;font-size:16px;">
          ✏️ Edit your message
        </p>
        <textarea id="quick-edit-textarea" style="
          display:block; width:100%; box-sizing:border-box;
          min-height:100px; border-radius:12px; resize:vertical;
          border:1px solid #333; padding:12px; font-size:14px;
          line-height:1.5; background:#fff; color:#000; outline:none;
        ">${msg.text}</textarea>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end;">
          <button id="quick-edit-cancel" style="
            padding:8px 14px;border-radius:10px;border:none;
            cursor:pointer;font-size:13px;background:#e6e6e6;color:#111;
          ">Cancel</button>
          <button id="quick-edit-delete" style="
            padding:8px 14px;border-radius:10px;border:none;
            cursor:pointer;font-size:13px;background:#e74c3c;color:#fff;
          ">🗑 Delete</button>
          <button id="quick-edit-save" style="
            padding:8px 14px;border-radius:10px;border:none;
            cursor:pointer;font-size:13px;background:#7a5af8;color:#fff;
          ">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(editor);

    document.getElementById("quick-edit-cancel").onclick = () => editor.remove();

    document.getElementById("quick-edit-save").onclick = async () => {
      const newText = document.getElementById("quick-edit-textarea").value.trim();
      if (!newText) return;
      const { error } = await supabaseClient
        .from("quick_chat")
        .update({ text: newText })
        .eq("id", msg.id);
      if (error) { alert("Edit failed: " + error.message); return; }
      editor.remove();
      loadMessages();
    };

    document.getElementById("quick-edit-delete").onclick = async () => {
      if (!confirm("Delete this message?")) return;
      const { error } = await supabaseClient
        .from("quick_chat")
        .delete()
        .eq("id", msg.id);
      if (error) { alert("Delete failed: " + error.message); return; }
      editor.remove();
      loadMessages();
    };

    // close on backdrop click
    editor.addEventListener("click", (e) => {
      if (e.target === editor) editor.remove();
    });
  }

  function renderMessages() {
    messagesEl.innerHTML = "";

    if (!messages.length) {
      messagesEl.innerHTML = `<div class="quick-empty-state">no little notes yet — leave one for each other? 💫</div>`;
      return;
    }

    for (const msg of messages) {
      const isMine = msg.sender === sender;
      const canEdit = isMine && editMode;

      const row = document.createElement("div");
      row.className = "quick-message-row sender-" + (msg.sender === "godbrand" ? "godbrand" : "sihaya");
      row.classList.add(isMine ? "mine" : "theirs");

      const bubble = document.createElement("div");
      bubble.className = "quick-message-bubble";
      if (canEdit) bubble.classList.add("can-edit");
      bubble.textContent = msg.text || "";

      // only show edit hint on your own messages in edit mode
      if (canEdit) {
        bubble.title = "Tap to edit";
        bubble.addEventListener("click", () => openEditModal(msg));
      }

      const time = document.createElement("div");
      time.className = "quick-message-time";
      time.textContent = formatTime(msg.created_at);

      row.appendChild(bubble);
      row.appendChild(time);
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
