window.initReminders = function () {
  const sb = window.supabaseClient;
  const ROOM_KEY = window.ROOM_KEY || "couple";

  const listEl = document.getElementById("reminder-list");
  const inputEl = document.getElementById("reminder-input");
  const addBtn = document.getElementById("add-reminder-btn");

  const editorBackdrop = document.getElementById("editorBackdrop");
  const editorArea = document.getElementById("editorArea");
  const editorSave = document.getElementById("editorSave");
  const editorCancel = document.getElementById("editorCancel");
  const editorTitle = document.getElementById("editorTitle");
  const historyBtn = document.getElementById("history-toggle");

  let editingId = null;
  let SHOW_HISTORY = false;
  let saving = false;

  function openEditor(text = "", id = null) {
    editingId = id;
    editorTitle.textContent = id ? "Edit Reminder" : "New Reminder";
    editorArea.value = text;
    editorBackdrop.classList.add("show");
    editorBackdrop.setAttribute("aria-hidden", "false");
    setTimeout(() => editorArea.focus(), 0);
  }

  function closeEditor() {
    editingId = null;
    editorBackdrop.classList.remove("show");
    editorBackdrop.setAttribute("aria-hidden", "true");
  }

  inputEl.addEventListener("click", () => openEditor(""));
  addBtn.addEventListener("click", () => openEditor(""));

  editorCancel.addEventListener("click", closeEditor);
  editorBackdrop.addEventListener("click", (e) => {
    if (e.target === editorBackdrop) closeEditor();
  });

  historyBtn.addEventListener("click", () => {
    SHOW_HISTORY = !SHOW_HISTORY;
    historyBtn.textContent = SHOW_HISTORY ? "Active" : "History";
    loadReminders();
  });

  editorSave.addEventListener("click", async () => {
    if (saving) return;
    saving = true;

    try {
      const text = editorArea.value.trim();
      if (!text) return closeEditor();

      if (editingId) {
        const { error } = await sb.from("reminders").update({ text }).eq("id", editingId);
        if (error) return alert(error.message);
      } else {
        const { error } = await sb.from("reminders").insert({ room_key: ROOM_KEY, text, done: false });
        if (error) return alert(error.message);
      }

      closeEditor();
      loadReminders();
    } finally {
      saving = false;
    }
  });

  async function loadReminders() {
    const { data, error } = await sb
      .from("reminders")
      .select("id,text,done,created_at")
      .eq("room_key", ROOM_KEY)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn(error);
      listEl.innerHTML = `<div style="font-size:12px;opacity:.8">Couldn’t load reminders.</div>`;
      return;
    }

    const rows = (data || []).filter(r => SHOW_HISTORY ? !!r.done : !r.done);

    listEl.innerHTML = "";
    if (!rows.length) {
      listEl.innerHTML = `<div style="font-size:12px;opacity:.8">${SHOW_HISTORY ? "No completed reminders yet." : "No reminders yet."}</div>`;
      return;
    }

    rows.forEach(r => {
      const item = document.createElement("div");
      item.className = "reminder-item";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!r.done;
      cb.disabled = SHOW_HISTORY;

      cb.addEventListener("change", async () => {
        const { error } = await sb.from("reminders").update({ done: cb.checked }).eq("id", r.id);
        if (error) alert(error.message);
        loadReminders();
      });

      const span = document.createElement("span");
      span.className = "reminder-text";
      span.textContent = r.text;
      if (r.done) span.classList.add("done");

      const edit = document.createElement("button");
      edit.className = "edit-btn";
      edit.type = "button";
      edit.textContent = "✏️";
      edit.addEventListener("click", () => openEditor(r.text, r.id));

      item.appendChild(cb);
      item.appendChild(span);
      item.appendChild(edit);
      listEl.appendChild(item);
    });
  }

  // realtime (simple)
  sb.channel("reminders-" + ROOM_KEY)
    .on("postgres_changes",
      { event: "*", schema: "public", table: "reminders", filter: `room_key=eq.${ROOM_KEY}` },
      () => loadReminders()
    )
    .subscribe();

  loadReminders();
};
