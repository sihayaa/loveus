// js/reminders.js

window.initReminders = function () {
  const supabaseClient = window.supabaseClient;
  const ROOM_KEY = window.ROOM_KEY;
  const HAS_SORT_COLUMN = window.HAS_SORT_COLUMN;
  const CURRENT_USER = window.CURRENT_USER;

  const listEl = document.getElementById('reminder-list');
  const inputEl = document.getElementById('reminder-input');
  const addBtn = document.getElementById('add-reminder-btn');

  const editorBackdrop = document.getElementById('editorBackdrop');
  const editorArea = document.getElementById('editorArea');
  const editorSave = document.getElementById('editorSave');
  const editorCancel = document.getElementById('editorCancel');
  const editorTitle = document.getElementById('editorTitle');
  let editingId = null;

  let SHOW_HISTORY = false;
  const historyBtn = document.getElementById('history-toggle');

  historyBtn.addEventListener('click', () => {
    SHOW_HISTORY = !SHOW_HISTORY;
    historyBtn.textContent = SHOW_HISTORY ? 'Active' : 'History';
    loadReminders();
  });

  function openEditor(prefill = '', id = null) {
    editingId = id;
    editorTitle.textContent = id ? 'Edit Reminder' : 'New Reminder';
    editorArea.value = prefill;
    editorBackdrop.classList.add('show');
    editorBackdrop.setAttribute('aria-hidden', 'false');
    setTimeout(() => editorArea.focus(), 0);
  }

  function closeEditor() {
    editingId = null;
    editorBackdrop.classList.remove('show');
    editorBackdrop.setAttribute('aria-hidden', 'true');
  }

  inputEl.addEventListener('click', () => openEditor(inputEl.value));
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') openEditor(inputEl.value);
  });

  editorCancel.addEventListener('click', closeEditor);
  editorBackdrop.addEventListener('click', (e) => {
    if (e.target === editorBackdrop) closeEditor();
  });

  editorArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) return;
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      editorSave.click();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      editorSave.click();
    }
  });

  editorSave.addEventListener('click', async () => {
    const text = (editorArea.value || '').trim();
    if (!text) {
      closeEditor();
      return;
    }
    if (editingId) {
      await updateReminderText(editingId, text);
    } else {
      await addReminderText(text);
    }
    closeEditor();
  });

  async function loadReminders() {
    if (!CURRENT_USER) return;

    const cols = HAS_SORT_COLUMN
      ? 'id, text, done, sort, created_at'
      : 'id, text, done, created_at';

    const { data, error } = await supabaseClient
      .from('reminders')
      .select(cols)
      .eq('room_key', ROOM_KEY);

    if (error) {
      console.warn('Load reminders error:', error.message);
      listEl.innerHTML = `<div style="font-size:12px;opacity:.8">Couldn’t load reminders.</div>`;
      return;
    }

    let rows = (data || []).filter((r) =>
      SHOW_HISTORY ? !!r.done : !r.done
    );

    // 🔒 No localStorage ordering. Only DB is the source of truth.
    if (!SHOW_HISTORY) {
      if (HAS_SORT_COLUMN) {
        // shared sort from DB
        rows.sort(
          (a, b) =>
            (a.sort ?? 0) - (b.sort ?? 0) ||
            (a.created_at > b.created_at ? 1 : -1)
        );
      } else {
        // fallback: newest first, same for everyone
        rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      }
    } else {
      // history: newest completed first
      rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    }

    renderReminders(rows);
  }

  function renderReminders(rows) {
    listEl.innerHTML = '';
    if (!rows.length) {
      listEl.innerHTML = `<div style="font-size:12px;opacity:.8">${
        SHOW_HISTORY ? 'No completed reminders yet.' : 'No reminders yet.'
      }</div>`;
      return;
    }

    rows.forEach((r) => {
      const item = document.createElement('div');
      item.className = 'reminder-item';
      item.dataset.id = r.id;
      // draggable only when not showing history AND using shared sort column
      item.draggable = !SHOW_HISTORY && !!HAS_SORT_COLUMN;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!r.done;

      if (SHOW_HISTORY) {
        cb.disabled = true;
      } else {
        cb.addEventListener('change', async () => {
          await toggleDone(r.id, cb.checked);
          if (cb.checked) {
            item.style.transition =
              'opacity .18s ease, height .18s ease, margin .18s ease, padding .18s ease';
            item.style.opacity = '0';
            item.style.margin = '0';
            item.style.paddingTop = '0';
            item.style.paddingBottom = '0';
            setTimeout(() => item.remove(), 200);
          }
        });
      }

      const span = document.createElement('span');
      span.className = 'reminder-text';
      span.textContent = r.text;
      if (SHOW_HISTORY || r.done) span.classList.add('done');

      const edit = document.createElement('button');
      edit.className = 'edit-btn';
      edit.title = 'Edit';
      edit.setAttribute('aria-label', 'Edit reminder');
      edit.textContent = '✏️';
      edit.addEventListener('click', () => openEditor(r.text, r.id));

      item.appendChild(cb);
      item.appendChild(span);
      item.appendChild(edit);
      listEl.appendChild(item);
    });

    if (!SHOW_HISTORY && HAS_SORT_COLUMN) wireDnD();
  }

  async function addReminderText(text) {
    if (!CURRENT_USER) return;
    const payload = { room_key: ROOM_KEY, text, done: false };
    if (HAS_SORT_COLUMN) payload.sort = Date.now();
    const { error } = await supabaseClient.from('reminders').insert(payload);
    if (error) console.warn('Add reminder error:', error.message);
    await loadReminders();
  }

  async function updateReminderText(id, text) {
    const { error } = await supabaseClient
      .from('reminders')
      .update({ text })
      .eq('id', id);
    if (error) console.warn('Update text error:', error.message);
    await loadReminders();
  }

  async function toggleDone(id, done) {
    const { error } = await supabaseClient
      .from('reminders')
      .update({ done })
      .eq('id', id);
    if (error) console.warn('Toggle error:', error.message);
    // optional: if you want instant refresh from DB as well:
    // await loadReminders();
  }

  async function addReminder() {
    const text = (inputEl.value || '').trim();
    if (!text) return;
    await addReminderText(text);
    inputEl.value = '';
  }

  addBtn.addEventListener('click', addReminder);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addReminder();
  });

  function wireDnD() {
    // if somehow called without sort column, just bail
    if (!HAS_SORT_COLUMN) return;

    const items = Array.from(listEl.querySelectorAll('.reminder-item'));
    let dragEl = null;

    items.forEach((it) => {
      it.addEventListener('dragstart', (e) => {
        dragEl = it;
        it.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', it.dataset.id);
      });

      it.addEventListener('dragend', () => {
        if (dragEl) dragEl.classList.remove('dragging');
        dragEl = null;
      });

      it.addEventListener('dragover', (e) => {
        e.preventDefault();
        const after = getDragAfterElement(listEl, e.clientY);
        if (!dragEl) return;
        if (after == null) listEl.appendChild(dragEl);
        else listEl.insertBefore(dragEl, after);
      });
    });

    listEl.addEventListener('drop', async () => {
      const orderIds = Array.from(listEl.querySelectorAll('.reminder-item')).map(
        (x) => x.dataset.id
      );

      if (HAS_SORT_COLUMN) {
        const base = Date.now();
        await Promise.all(
          orderIds.map((id, idx) =>
            supabaseClient
              .from('reminders')
              .update({ sort: base + idx })
              .eq('id', id)
          )
        );
      }
    });

    function getDragAfterElement(container, y) {
      const els = [
        ...container.querySelectorAll('.reminder-item:not(.dragging)'),
      ];
      return els.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element;
    }
  }

  // initial load + realtime
  loadReminders();

  supabaseClient
    .channel('reminders-feed')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reminders',
        filter: `room_key=eq.${ROOM_KEY}`,
      },
      loadReminders
    )
    .subscribe();
};
