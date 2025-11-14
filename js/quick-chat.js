window.initQuickChat = function () {
  const supabaseClient = window.supabaseClient;
  const CURRENT_USER = window.CURRENT_USER;
  const ROOM_KEY = window.ROOM_KEY || "couple";

  if (!supabaseClient || !CURRENT_USER) {
    console.warn("Quick chat: supabaseClient or CURRENT_USER not ready");
    return;
  }

  // --- DOM refs ---
  const shell = document.getElementById("quick-chat-shell");
  if (!shell) return;

  const messagesEl = document.getElementById("quick-messages");
  const formEl = document.getElementById("quick-message-form");
  const inputEl = document.getElementById("quick-message-input");
  const btnGodbrand = document.getElementById("quick-btn-godbrand");
  const btnSihaya = document.getElementById("quick-btn-sihaya");
  const switchTrack = document.getElementById("quick-sender-switch-track");
  const switchThumb = document.getElementById("quick-sender-switch-thumb");
  const editIndicator = document.getElementById("quick-editing-indicator");
  const editPreview = document.getElementById("quick-editing-preview");
  const cancelEditBtn = document.getElementById("quick-cancel-edit");
  const sendBtn = document.getElementById("quick-send-btn");

  if (!messagesEl || !formEl || !inputEl || !btnGodbrand || !btnSihaya ||
      !switchTrack || !switchThumb || !editIndicator || !editPreview || !cancelEditBtn || !sendBtn) {
    console.warn("Quick chat: missing DOM elements");
    return;
  }

  let messages = [];
  let editingId = null;

  // --- sender state with browser memory ---
  const SENDER_KEY = "quickChatSender";
  const email = (CURRENT_USER.email || "").toLowerCase();

  let sender = localStorage.getItem(SENDER_KEY);
  if (!sender) {
    // default per user email
    if (email === "gokumeng48@gmail.com") sender = "sihaya";
    else if (email === "micdmick@gmail.com") sender = "godbrand";
    else sender = "sihaya";
    localStorage.setItem(SENDER_KEY, sender);
  }

  function setSender(newSender) {
    sender = newSender === "godbrand" ? "godbrand" : "sihaya";
    localStorage.setItem(SENDER_KEY, sender);
    applySenderUI();
  }

  function applySenderUI() {
    // active button
    if (sender === "sihaya") {
      btnSihaya.classList.add("active");
      btnGodbrand.classList.remove("active");
      // thumb left
      switchThumb.style.transform = "translateX(0)";
    } else {
      btnGodbrand.classList.add("active");
      btnSihaya.classList.remove("active");
      // thumb right (~20px)
      switchThumb.style.transform = "translateX(20px)";
    }
  }

  btnSihaya.addEventListener("click", (e) => {
    e.preventDefault();
    setSender("sihaya");
  });

  btnGodbrand.addEventListener("click", (e) => {
    e.preventDefault();
    setSender("godbrand");
  });

  switchTrack.addEventListener("click", (e) => {
    e.preventDefault();
    setSender(sender === "sihaya" ? "godbrand" : "sihaya");
  });

  applySenderUI();

  async function loadMessages() {
    const { data, error } = await supabaseClient
      .from("quick_chat")
      .select("id, room_key, user_id, sender, text, created_at, updated_at, is_checked, hide_after")
      .eq("room_key", ROOM_KEY)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Quick chat load error:", error.message);
      messagesEl.innerHTML = `<div class="quick-empty-state">couldn’t load notes right now 💧</div>`;
      return;
    }

    const now = new Date();
    messages = (data || []).filter((row) => {
      if (!row.hide_after) return true;
      const hideAt = new Date(row.hide_after);

      return hideAt > now;
    });

    renderMessages();
  }

  function renderMessages() {
    messagesEl.innerHTML = "";

    if (!messages.length) {
      messagesEl.innerHTML = `<div class="quick-empty-state">no little notes yet — leave one for each other? 💫</div>`;
      return;
    }

    const currentUserId = CURRENT_USER.id;

    messages.forEach((msg) => {
      const row = document.createElement("div");
      row.className = "quick-message-row sender-" + (msg.sender === "godbrand" ? "godbrand" : "sihaya");
      row.dataset.id = msg.id;

      const cbWrap = document.createElement("div");
      cbWrap.className = "quick-hide-checkbox-wrapper";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!msg.is_checked;
      cb.addEventListener("change", () => handleCheckToggle(msg, cb));

      cbWrap.appendChild(cb);

      const bubble = document.createElement("div");
      bubble.className = "quick-message-bubble";
      if (msg.is_checked) {
        bubble.classList.add("quick-message-checked");
      }

      const header = document.createElement("div");
      header.className = "quick-message-header";

      const senderSpan = document.createElement("span");
      senderSpan.className = "quick-message-sender";
      senderSpan.textContent = msg.sender === "godbrand" ? "Godbrand 💜" : "Sihaya 💚";

      const timeSpan = document.createElement("span");
      timeSpan.className = "quick-message-time";
      timeSpan.textContent = formatTime(msg.created_at);

      header.appendChild(senderSpan);
      header.appendChild(timeSpan);

      const body = document.createElement("div");
      body.className = "quick-message-body";
      body.textContent = msg.text || "";

      bubble.appendChild(header);
      bubble.appendChild(body);

      if (msg.user_id === currentUserId) {
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "quick-edit-icon";
        editBtn.title = "Edit note";
        editBtn.textContent = "✏️";
        editBtn.addEventListener("click", () => startEditing(msg));
        bubble.appendChild(editBtn);
      }

      row.appendChild(cbWrap);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
    });


    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      day: "2-digit"
    });
  }

  async function handleCheckToggle(msg, checkbox) {
    const is_checked = checkbox.checked;
    const now = new Date();
    let hide_after = null;

    if (is_checked) {

      hide_after = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    msg.is_checked = is_checked;
    msg.hide_after = hide_after;
    renderMessages();

    const { error } = await supabaseClient
      .from("quick_chat")
      .update({ is_checked, hide_after })
      .eq("id", msg.id);

    if (error) {
      console.warn("Quick chat check update error:", error.message);
    }
  }

  function startEditing(msg) {
    editingId = msg.id;
    inputEl.value = msg.text || "";
    editIndicator.style.display = "block";
    editPreview.textContent = shorten(msg.text || "");
    cancelEditBtn.style.display = "inline-block";
    inputEl.focus();
  }

  function cancelEditing() {
    editingId = null;
    editIndicator.style.display = "none";
    editPreview.textContent = "";
    cancelEditBtn.style.display = "none";
    inputEl.value = "";
  }

  function shorten(text, max = 40) {
    if (!text) return "";
    text = text.replace(/\s+/g, " ").trim();
    return text.length > max ? text.slice(0, max) + "…" : text;
  }

  cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    cancelEditing();
  });

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (inputEl.value || "").trim();
    if (!text && !editingId) return;

    sendBtn.disabled = true;

    try {
      if (editingId) {
        const id = editingId;
        const { error } = await supabaseClient
          .from("quick_chat")
          .update({
            text,
            updated_at: new Date().toISOString()
          })
          .eq("id", id)
          .eq("user_id", CURRENT_USER.id); 

        if (error) {
          console.warn("Quick chat edit error:", error.message);
        } else {
          cancelEditing();
          await loadMessages();
        }
      } else {
        const payload = {
          room_key: ROOM_KEY,
          user_id: CURRENT_USER.id,
          sender: sender === "godbrand" ? "godbrand" : "sihaya",
          text,
          is_checked: false,
          hide_after: null
        };

        const { error } = await supabaseClient
          .from("quick_chat")
          .insert(payload);

        if (error) {
          console.warn("Quick chat insert error:", error.message);
        } else {
          inputEl.value = "";
          await loadMessages();
        }
      }
    } finally {
      sendBtn.disabled = false;
    }
  });

  supabaseClient
    .channel("quick-chat-feed")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quick_chat", filter: `room_key=eq.${ROOM_KEY}` },
      () => {
  
        loadMessages();
      }
    )
    .subscribe();

  loadMessages();
};
