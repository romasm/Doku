const BASE = '/api';

export async function fetchConfig() {
  const res = await fetch(`${BASE}/config`);
  if (!res.ok) throw new Error('Failed to load config');
  return res.json();
}

export async function fetchTree() {
  const res = await fetch(`${BASE}/tree`);
  if (!res.ok) throw new Error('Failed to load tree');
  return res.json();
}

export async function fetchDoc(docPath) {
  const res = await fetch(`${BASE}/doc/${docPath}`);
  if (!res.ok) throw new Error('Failed to load document');
  return res.json();
}

export async function saveDoc(docPath, content) {
  const res = await fetch(`${BASE}/doc/${docPath}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to save document');
  return res.json();
}

export async function deleteDoc(docPath) {
  const res = await fetch(`${BASE}/doc/${docPath}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

export async function createFolder(folderPath) {
  const res = await fetch(`${BASE}/folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: folderPath }),
  });
  if (!res.ok) throw new Error('Failed to create folder');
  return res.json();
}

export async function moveDoc(from, to) {
  const res = await fetch(`${BASE}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to }),
  });
  if (!res.ok) throw new Error('Failed to move document');
  return res.json();
}

export async function fetchFolder(folderPath) {
  const res = await fetch(`${BASE}/folder/${folderPath}`);
  if (!res.ok) throw new Error('Failed to load folder');
  return res.json();
}

export async function saveFolderIndex(folderPath, content) {
  // The index file is the sibling .md (e.g. guides.md for guides/)
  return saveDoc(folderPath, content);
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function searchDocs(query) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
