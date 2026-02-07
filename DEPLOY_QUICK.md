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

### Paso 3: Esperar el Deploy

Railway ejecutará:
1. `npm install` (instala dependencias raíz)
2. **postinstall**: Instala server y client, **construye el cliente**
3. `npm start`: Inicia el servidor que sirve el frontend en `/`

El proceso toma ~2-3 minutos.

### Paso 4: Verificar que funciona

1. En Railway, copia la URL del proyecto (ej: `ceap-tracker-production.up.railway.app`)
2. Abre en navegador → **Deberías ver el dashboard**
3. Haz clic en un plantel → Debería cargar detalles

### Paso 5: Ejecutar Migraciones de BD (Importante)

Por primera vez, necesitas crear las tablas:

Opción A - Railway CLI:
```bash
railway run npm run migrate
```

Opción B - Dashboard de Railway:
1. Abre tu proyecto
2. Abre "ceap-tracker" service
3. Ve a la pestaña "Deploy" 
4. Click en "CLI"
5. Ejecuta: `npm run migrate`

Después de esto, la base de datos tendrá todas las tablas y fases listas.

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

No necesitas configurar manualmente si estás en producción.

Para desarrollo local, crea `server/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=ceap_tracker
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

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
- [ ] Frontend carga en navegador
- [ ] Dashboard muestra los planteles
- [ ] Click en plantel abre detalles
- [ ] Migraciones ejecutadas (`npm run migrate`)
- [ ] Puedes editar fases y guardar (conexión a BD)
- [ ] Datos persisten al recargar página

---

## 🚨 Troubleshooting

### Frontend muestra "Ruta no encontrada"
→ Migraciones no ejecutadas. Ejecuta: `railway run npm run migrate`

### Error "Cannot GET /"
→ El build del cliente no se hizo. Revisa Build Logs en Railway

### Error "Cannot connect to database"
→ PostgreSQL no se conectó. Verifica `DATABASE_URL` en Variables

### Puerto incorrecto
→ Railway asigna automáticamente. Usa el puerto que proporciona.

---

## 📚 Documentación Adicional

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/cli/commands)
- [PostgreSQL en Railway](https://docs.railway.app/plugins/postgresql)

---

¡Listo! Con `git push` tu aplicación estará en vivo. 🚀

