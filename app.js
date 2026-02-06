// Este script conecta el frontend con el backend para mostrar y agregar items
async function fetchItems() {
    const res = await fetch('/api/items');
    const items = await res.json();
    const list = document.getElementById('items-list');
    list.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        list.appendChild(li);
    });
}

async function addItem(e) {
    e.preventDefault();
    const input = document.getElementById('item-input');
    const name = input.value.trim();
    if (!name) return;
    await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    input.value = '';
    fetchItems();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-item-form').addEventListener('submit', addItem);
    fetchItems();
});
