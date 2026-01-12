<script>
  const sb = window.supabaseClient;

  async function uploadPhoto() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];
    const caption = document.getElementById('caption').value.trim();
    if (!file) return;

    const filePath = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await sb.storage
      .from('memories')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    const imageUrl = sb.storage
      .from('memories')
      .getPublicUrl(filePath).data.publicUrl;

    await sb.from('memories').insert([
      { image_url: imageUrl, caption, file_path: filePath }
    ]);

    fileInput.value = '';
    document.getElementById('caption').value = '';
    document.getElementById('preview-thumb').style.display = 'none';

    loadGallery();
  }

  async function loadGallery() {
    const order = document.getElementById('orderSelect').value || 'asc';

    const { data, error } = await sb
      .from('memories')
      .select('*')
      .order('created_at', { ascending: order === 'asc' });

    if (error) {
      console.error('Load error:', error);
      return;
    }

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    data.forEach(item => {
      const block = document.createElement('div');
      block.className = 'photo-block';

      const utcDate = new Date(item.created_at + 'Z');

      const manilaTime = utcDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Manila'
      });

      const vegasTime = utcDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Los_Angeles'
      });

      block.innerHTML = `
        <span class="delete-btn" onclick="triggerDelete('${item.id}')">✖</span>
        <span class="edit-btn" onclick="triggerEdit('${item.id}', \`${item.caption || ''}\`)">✎</span>
        <img src="${item.image_url}" alt="Memory"
             onclick="showLightbox('${item.image_url}', \`${item.caption || ''}\`)">
        <div class="timestamp">
          Manila: ${manilaTime}<br>
          Vegas: ${vegasTime}
        </div>
        <p>${item.caption || ''}</p>
      `;

      gallery.appendChild(block);
    });
  }

  function openModal(title, message, showTextarea, callback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalText').textContent = message;

    const textarea = document.getElementById('modalTextarea');
    textarea.style.display = showTextarea ? 'block' : 'none';
    textarea.value = '';

    document.getElementById('modalOverlay').style.display = 'flex';

    document.getElementById('modalYes').onclick = async () => {
      await callback(textarea.value.trim());
      document.getElementById('modalOverlay').style.display = 'none';
    };

    document.getElementById('modalNo').onclick = () => {
      document.getElementById('modalOverlay').style.display = 'none';
    };
  }

  function triggerDelete(id) {
    openModal('Are you sure?', 'Delete this memory?', false, async () => {
      await sb.from('memories').delete().eq('id', id);
      loadGallery();
    });
  }

  function triggerEdit(id, oldCap) {
    openModal('Edit Caption', '', true, async (newCaption) => {
      await sb.from('memories').update({ caption: newCaption }).eq('id', id);
      loadGallery();
    });
    document.getElementById('modalTextarea').value = oldCap;
  }

  function showLightbox(src, caption) {
    const lightbox = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-caption').innerHTML = caption;
    lightbox.style.display = 'flex';
  }

  document.getElementById('uploadBtn').addEventListener('click', uploadPhoto);

  document.querySelector('input[type="file"]').addEventListener('change', e => {
    const preview = document.getElementById('preview-thumb');
    if (e.target.files && e.target.files[0]) {
      preview.src = URL.createObjectURL(e.target.files[0]);
      preview.style.display = 'inline-block';
    }
  });

  document.getElementById('orderSelect').addEventListener('change', loadGallery);

  loadGallery();
</script>
