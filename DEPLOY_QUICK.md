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

### Paso 3: Configurar Variables de Entorno

En el dashboard de Railway:

#### Para la base de datos PostgreSQL
Railway crea automáticamente: `DATABASE_URL`

#### Para el servidor
```
NODE_ENV=production
PORT=5000
```

#### Para el cliente
```
REACT_APP_API_URL=https://<backend-url>/api
```

(Reemplaza `<backend-url>` con la URL que Railway asigna al backend)

### Paso 4: Ejecutar Migraciones

Opción A - Railway CLI:
```bash
railway run npm --prefix server run migrate
```

Opción B - Manualmente en Railway Dashboard:
1. Abre el servicio del backend
2. Ve a "Deployment" → "Terminal"
3. Ejecuta: `npm run migrate`

### Paso 5: Verificar Deployment

- Frontend: `https://ceap-tracker-client-production.up.railway.app`
- Backend: `https://ceap-tracker-server-production.up.railway.app`

Abre el frontend en tu navegador. ¡Listo!

---

## 🔄 Flujo de Actualizaciones

Cada vez que hagas push a `main`:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

**Railway automáticamente:**
1. Detecta el nuevo commit
2. Construye la aplicación
3. Despliega los cambios
4. Reinicia los servicios

---

## 🔧 Configuración Monorepo

El archivo `railway.json` está configurado para que Railway entienda que es un monorepo.

Si necesitas cambios específicos por servicio, puedes crear:
- `server/railway.json`
- `client/railway.json`

---

## 📦 Estructura de Deploy

Railway desplegará automáticamente:

```
ceap-tracker/
├── server/        → Backend: Node.js
├── client/        → Frontend: React (build estático)
└── railway.json   → Configuración
```

---

## 🛠️ Comandos Útiles en Railway

### Ver logs
```bash
railway logs
```

### Ver estado
```bash
railway status
```

### Conectar a BD remotamente
```bash
railway connect postgres
```

### Ejecutar comando en producción
```bash
railway run npm run migrate
```

---

## ✅ Checklist de Deploy

- [ ] Código subido a GitHub
- [ ] Railway conectado al repositorio
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Frontend accesible
- [ ] Backend respondiendo
- [ ] Dashboard mostrando datos

---

## 🚨 Troubleshooting

### Build falla
→ Revisar logs en Railway Dashboard

### BD no conecta
→ Verificar que `DATABASE_URL` esté configurada automáticamente

### Frontend no ve el backend
→ Actualizar `REACT_APP_API_URL` con la URL correcta de Railway

### Migraciones no ejecutadas
→ Ejecutar manualmente en Railway CLI o terminal del Dashboard

---

## 📞 Soporte Railway

- Documentación: https://docs.railway.app
- Status: https://status.railway.app
- Community: https://railway.app/discord

---

Con este flujo, tu aplicación se actualiza automáticamente cada vez que hagas push. ¡Sin pasos manuales!
