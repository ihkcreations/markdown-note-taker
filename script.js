const STORAGE_KEY = "markdown_notes_app";
let notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    id: "1",
    title: "Welcome Note",
    body: "# Welcome\n\nThis is a simple markdown note taker.\n\n- Type markdown on the left\n- See live preview on the right\n- Notes save automatically",
    updated: Date.now()
  }
];
let activeId = notes[0] ? notes[0].id : null;
const newBtn = document.getElementById("new-btn");
const exportBtn = document.getElementById("export-btn");
const searchInput = document.getElementById("search-input");
const notesList = document.getElementById("notes-list");
const noteTitle = document.getElementById("note-title");
const noteBody = document.getElementById("note-body");
const previewPane = document.getElementById("preview-pane");
function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function parseMarkdown(md) {
  let html = escapeHtml(md);
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  html = html.replace(/^\- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
    if (p.startsWith("<h") || p.startsWith("<ul>")) {
      return p;
    }
    return `<p>${p.replace(/\n/g, "<br>")}</p>`;
  }).join("");
}
function renderList() {
  const filter = searchInput.value.toLowerCase();
  notesList.innerHTML = "";
  const filtered = notes.filter(n => n.title.toLowerCase().includes(filter) || n.body.toLowerCase().includes(filter));
  filtered.forEach(n => {
    const li = document.createElement("li");
    li.className = "note-item";
    if (n.id === activeId) {
      li.classList.add("active");
    }
    const titleDiv = document.createElement("div");
    titleDiv.className = "note-item-title";
    titleDiv.textContent = n.title || "Untitled Note";
    const dateDiv = document.createElement("div");
    dateDiv.className = "note-item-date";
    dateDiv.textContent = new Date(n.updated).toLocaleDateString();
    li.appendChild(titleDiv);
    li.appendChild(dateDiv);
    li.addEventListener("click", () => {
      activeId = n.id;
      loadActiveNote();
      renderList();
    });
    notesList.appendChild(li);
  });
}
function loadActiveNote() {
  const active = notes.find(n => n.id === activeId);
  if (active) {
    noteTitle.value = active.title;
    noteBody.value = active.body;
    previewPane.innerHTML = parseMarkdown(active.body);
    noteTitle.disabled = false;
    noteBody.disabled = false;
  } else {
    noteTitle.value = "";
    noteBody.value = "";
    previewPane.innerHTML = "";
    noteTitle.disabled = true;
    noteBody.disabled = true;
  }
}
function updateActiveNote() {
  const active = notes.find(n => n.id === activeId);
  if (!active) return;
  active.title = noteTitle.value;
  active.body = noteBody.value;
  active.updated = Date.now();
  saveNotes();
  previewPane.innerHTML = parseMarkdown(active.body);
  renderList();
}
newBtn.addEventListener("click", () => {
  const newNote = {
    id: Date.now().toString(),
    title: "New Note",
    body: "",
    updated: Date.now()
  };
  notes.unshift(newNote);
  activeId = newNote.id;
  saveNotes();
  renderList();
  loadActiveNote();
  noteTitle.focus();
});
exportBtn.addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8,";
  const encoded = encodeURIComponent(JSON.stringify(notes, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr + encoded);
  dlAnchor.setAttribute("download", "notes_export.json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
});
searchInput.addEventListener("input", () => {
  renderList();
});
noteTitle.addEventListener("input", updateActiveNote);
noteBody.addEventListener("input", updateActiveNote);
renderList();
loadActiveNote();
