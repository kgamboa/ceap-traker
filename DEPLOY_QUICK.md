# Deploy Rápido en Railway

## 🚀 Flujo: GitHub → Railway (Automático)

### Paso 1: Preparar repositorio

```bash
git init
git add .
git commit -m "CEaP Tracker - Sistema de seguimiento"
git branch -M main
git remote add origin https://github.com/tu-usuario/ceap-tracker.git
git push -u origin main
```

### Paso 2: Conectar en Railway

1. Ve a https://railway.app
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub"**
4. Busca y selecciona tu repositorio `ceap-tracker`
5. Railway detectará automáticamente la estructura

Railway **automáticamente**:
- ✅ Instala dependencias (server + client)
- ✅ Construye el cliente React
- ✅ Crea base de datos PostgreSQL
- ✅ Asigna `DATABASE_URL` automáticamente
- ✅ Inicia el servidor en puerto 8080

### Paso 3: Esperar el Deploy (2-3 minutos)

Railway ejecutará:
1. `npm install` (instala dependencias raíz)
2. **postinstall**: Instala server y client, **construye el cliente**
3. `npm start`: Inicia el servidor que sirve el frontend en `/`

Verás "Build time: XX seconds" cuando esté listo.

### Paso 4: Verificar que funciona

Tu URL estará en la sección "Domains" de Railway:

```
https://ceap-tracker-production.up.railway.app
```

Abre en navegador → Deberías ver el **dashboard vacío** (sin datos aún)

---

## ⚠️ IMPORTANTE: Ejecutar Migraciones (Primera vez)

Las migraciones crean las tablas en PostgreSQL. **Esto se hace EN RAILWAY, no en tu PC**.

### Opción A: Railway CLI (Si tienes instalado)

En tu terminal local:
```bash
railway run npm run migrate
```

### Opción B: Panel de Railway (Recomendado - sin instalar nada)

1. Ve a https://railway.app
2. Abre tu proyecto `ceap-tracker`
3. Haz clic en el servicio `ceap-tracker`
4. Ve a la pestaña **"Deploy"**
5. Haz clic en el botón **"CLI"** (esquina inferior derecha)
6. Se abre una terminal integrada
7. Copia y pega:
```bash
npm run migrate
```
8. Presiona Enter
9. Espera a ver "✓ Migraciones completadas exitosamente"

### Paso 5: ¡Listo!

Ahora:
- ✅ Dashboard visible
- ✅ 25 planteles cargados
- ✅ Puedes editar fases
- ✅ Los cambios se guardan en PostgreSQL

---

---

## 🔄 Actualizar el código

Cada vez que hagas push a `main`, Railway automáticamente:
1. Detecta los cambios
2. Reconstruye el cliente
3. Reinicia el servidor

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

---

## 📊 Variables de Entorno

Railway proporciona automáticamente:
- ✅ `DATABASE_URL` - Conexión a PostgreSQL
- ✅ `PORT` - Puerto (8080 en Railway)

No necesitas configurar manualmente.

---

## 🗄️ PostgreSQL en Railway

Railway **automáticamente**:
- ✅ Crea una instancia PostgreSQL
- ✅ Proporciona `DATABASE_URL`
- ✅ Gestiona backups
- ✅ Proporciona acceso público (si lo habilitas)

Para conectarte remotamente:
```bash
railway connect postgres
```

O usar psql:
```bash
psql $DATABASE_URL
```

---

## 📁 Estructura del Proyecto

```
ceap-tracker/
├── server/
│   ├── src/
│   │   ├── server.js      ← Sirve frontend + API
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── models/
│   ├── migrations/
│   └── package.json
├── client/                 ← React (se compila a build/)
│   ├── src/
│   ├── public/
│   └── package.json
├── package.json            ← Orquesta todo
├── railway.json            ← Config Railway
└── Procfile               ← Procesos
```

---

## 🎯 URL Final

- Frontend: `https://ceap-tracker-production.up.railway.app/`
- API: `https://ceap-tracker-production.up.railway.app/api/`

Railway genera un nombre automático. Puedes:
1. Cambiar el nombre en "Settings" → "Railway Config File"
2. Agregar dominio personalizado en "Domains"

---

## ✅ Checklist Post-Deploy

- [ ] Proyecto visible en https://railway.app
- [ ] Frontend carga en navegador (ej: ceap-tracker-production.up.railway.app)
- [ ] Dashboard muestra "Cargando..."
- [ ] Ejecutaste migraciones (`railway run npm run migrate`)
- [ ] Dashboard muestra 25 planteles
- [ ] Click en plantel abre detalles
- [ ] Puedes editar fases
- [ ] Datos persisten al recargar página

---

## 🚨 Troubleshooting
"Cargando..." infinito en dashboard
→ Migraciones no ejecutadas. Ejecuta: `railway run npm run migrate`

### Error "Ruta no encontrada"
→ Frontend no compiló correctamente. Ve a Build Logs en Railway

### Error "Cannot connect to database"
→ PostgreSQL no se creó. Railway debe crear automáticamente. Contacta soporte.

### Dashboard no muestra planteles
→ Migraciones incompletas. Verifica con: `railway run npm run migrate`
→ Railway asigna automáticamente. Usa el puerto que proporciona.

---

## 📞 ¿Dónde ejecutar qué?

| Comando | Dónde |
|---------|-------|
| `git push` | Terminal local (tu PC) |
| `railway run npm run migrate` | Terminal local O Panel Railway |
| `npm run dev` | Terminal local (desarrollo) |
| Cambios de código | En tu editor local, luego push |

---

## 🎯 URLs Finales

- **Frontend**: `https://ceap-tracker-production.up.railway.app`
- **API**: `https://ceap-tracker-production.up.railway.app/api/`

Puedes cambiar el nombre en Railway Settings si quieres.

---

¡Listo! Con `git push` y `railway run npm run migrate` tu aplicación está lista. 🚀

