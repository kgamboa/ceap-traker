// Este script conecta el frontend con el backend para mostrar y agregar items
async function fetchItems() {
    const res = await fetch('/api/items');
    let items;
    try {
        items = await res.json();
    } catch (e) {
        items = [];
    }
    const list = document.getElementById('items-list');
    list.innerHTML = '';
    if (Array.isArray(items)) {
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<b>${item.plantel || ''}</b> | Ciclo: ${item.ciclo_ceap || ''} | Fase: ${item.fase || ''} | Estatus: ${item.estatus || ''} | Observaciones: ${item.observaciones || ''} | Estimada: ${item.fecha_estimada || ''} | Concluido: ${item.fecha_concluido || ''}`;
            list.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Error cargando items';
        list.appendChild(li);
    }
}

async function addItem(e) {
    e.preventDefault();
    const plantel = document.getElementById('plantel-input').value.trim();
    const ciclo_ceap = document.getElementById('ciclo-input').value.trim();
    const fase = document.getElementById('fase-input').value.trim();
    const estatus = document.getElementById('estatus-input').value.trim();
    const observaciones = document.getElementById('observaciones-input').value.trim();
    const fecha_estimada = document.getElementById('fecha-estimada-input').value;
    const fecha_concluido = document.getElementById('fecha-concluido-input').value;

    if (!plantel) return;
    await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantel, ciclo_ceap, fase, estatus, observaciones, fecha_estimada, fecha_concluido })
    });
    document.getElementById('add-item-form').reset();
    fetchItems();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-item-form').addEventListener('submit', addItem);
    fetchItems();
});
