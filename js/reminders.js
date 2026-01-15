// js/reminders.js
window.initReminders = function () {
  // ✅ guard: prevents double listeners + double realtime + double saves
  if (window.__REMINDERS_INITED) return;
  window.__REMINDERS_INITED = true;

  const supabaseClient = window.supabaseClient;
  const ROOM_KEY = window.ROOM_KEY || "couple";
  const HAS_SORT_COLUMN = !!window.HAS_SORT_COLUMN;

  if (!supabaseClient) {
    console.warn("Reminders: supabaseClient not ready yet");
    return;
  }

  const listEl = document.getElementById("reminder-list");
  const inputEl = document.getElementById("reminder-input");
  const addBtn = document.getElementById("add-reminder-btn");

  const editorBackdrop = document.getElementById("editorBackdrop");
  const editorArea = document.getElementById("editorArea");
  const editorSave = document.getElementById("editorSave");
  const editorCancel = document.getElementById("editorCancel");
  const editorTitle = document.getElementById("editorTitle");
  const historyBtn = document.getElementById("history-toggle");

  if (!listEl || !inputEl || !addBtn) {
    console.warn("Reminders: missing core DOM elements");
    return;
  }

  let editingId = null;
  let SHOW_HISTORY = false;
  let saving = false;

  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      SHOW_HISTORY = !SHOW_HISTORY;
      historyBtn.textContent = SHOW_HISTORY ? "Active" : "History";
      loadReminders();
    });
  }

  function openEditor(prefill = "", id = null) {
    editingId = id;
    if (editorTitle) editorTitle.textContent = id ? "Edit Reminder" : "New Reminder";
    if (editorArea) editorArea.value = prefill;

    if (editorBackdrop) {
      editorBackdrop.classList.add("show");
      editorBackdrop.setAttribute("aria-hidden", "false");
    }
    setTimeout(() => editorArea && editorArea.focus(), 0);
  }

  function closeEditor() {
    editingId = null;
    if (!editorBackdrop) return;
    editorBackdrop.classList.remove("show");
    editorBackdrop.setAttribute("aria-hidden", "true");
  }

  inputEl.addEventListener("click", () => openEditor(""));
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openEditor("");
  });

  addBtn.addEventListener("click", () => openEditor(""));

  if (editorCancel) editorCancel.addEventListener("click", closeEditor);
  if (editorBackdrop) {
    editorBackdrop.addEventListener("click", (e) => {
      if (e.target === editorBackdrop) closeEditor();
    });
  }

  if (editorSave) {
    editorSave.addEventListener("click", async () => {
      if (saving) return;
      saving = true;

      try {
        const text = (editorArea?.value || "").trim();
        if (!text) {
          closeEditor();
          return;
        }

        if (editingId) await updateReminderText(editingId, text);
        else await addReminderText(text);

        closeEditor();
      } finally {
        saving = false;
      }
    });
  }

  async function loadReminders() {
    const cols = HAS_SORT_COLUMN
      ? "id, text, done, sort, created_at"
      : "id, text, done, created_at";

    const { data, error } = await supabaseClient
      .from("reminders")
      .select(cols)
      .eq("room_key", ROOM_KEY);

    if (error) {
      console.warn("Load reminders error:", error.message);
      listEl.innerHTML = `<div style="font-size:12px;opacity:.8">Couldn’t load reminders.</div>`;
      return;
    }

    let rows = (data || []).filter((r) => (SHOW_HISTORY ? !!r.done : !r.done));

    rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    renderReminders(rows);
  }

  function renderReminders(rows) {
    listEl.innerHTML = "";
    if (!rows.length) {
      listEl.innerHTML = `<div style="font-size:12px;opacity:.8">${SHOW_HISTORY ? "No completed reminders yet." : "No reminders yet."}</div>`;
      return;
    }

    rows.forEach((r) => {
      const item = document.createElement("div");
      item.className = "reminder-item";
      item.dataset.id = r.id;

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!r.done;

      if (SHOW_HISTORY) {
        cb.disabled = true;
      } else {
        cb.addEventListener("change", async () => {
          await toggleDone(r.id, cb.checked);
          if (cb.checked) loadReminders();
        });
      }

      const span = document.createElement("span");
      span.className = "reminder-text";
      span.textContent = r.text;
      if (SHOW_HISTORY || r.done) span.classList.add("done");

      const edit = document.createElement("button");
      edit.className = "edit-btn";
      edit.title = "Edit";
      edit.type = "button";
      edit.textContent = "✏️";
      edit.addEventListener("click", () => openEditor(r.text, r.id));

      item.appendChild(cb);
      item.appendChild(span);
      item.appendChild(edit);
      listEl.appendChild(item);
    });
  }

  async function addReminderText(text) {
    const payload = { room_key: ROOM_KEY, text, done: false };
    if (HAS_SORT_COLUMN) payload.sort = Date.now();

    const { error } = await supabaseClient.from("reminders").insert(payload);
    if (error) alert("Add reminder failed: " + error.message);

    await loadReminders();
  }

  async function updateReminderText(id, text) {
    const { error } = await supabaseClient.from("reminders").update({ text }).eq("id", id);
    if (error) alert("Update failed: " + error.message);

    await loadReminders();
  }

  async function toggleDone(id, done) {
    const { error } = await supabaseClient.from("reminders").update({ done }).eq("id", id);
    if (error) alert("Toggle failed: " + error.message);
  }

  // realtime
  supabaseClient
    .channel("reminders-feed-" + ROOM_KEY)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reminders", filter: `room_key=eq.${ROOM_KEY}` },
      loadReminders
    )
    .subscribe();

  loadReminders();
};
