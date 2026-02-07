# 🛠️ Guía de Configuración: CEaP Tracker

Este archivo explica **exactamente** dónde ejecutar cada comando.

---

## 🌐 SCENARIO A: Deploy en Railway (Producción)

**¿Qué es?** Publicar la aplicación en internet para que accedan los 25 planteles.

### Paso 1: Preparar el repositorio

En tu **terminal local (tu PC)**:
```bash
git add -A
git commit -m "tu-mensaje"
git push origin main
```

### Paso 2: Conectar con Railway

1. Ve a https://railway.app
2. Click en "New Project" → "Deploy from GitHub"
3. Selecciona tu repositorio `ceap-tracker`
4. Railway automáticamente:
   - ✅ Instala dependencias
   - ✅ Compila React
   - ✅ Crea PostgreSQL
   - ✅ Inicia el servidor

**Espera 2-3 minutos para que termine**

### Paso 3: Ejecutar migraciones (IMPORTANTE)

Ahora necesitas crear las tablas en PostgreSQL. **Esto se hace EN RAILWAY**, no en tu PC.

**Opción A: Railway CLI (si tienes instalado)**
En tu **terminal local**:
```bash
railway run npm run migrate
```

**Opción B: Panel de Railway (sin instalar nada)**
1. Ve a tu proyecto en https://railway.app
2. Haz click en el servicio `ceap-tracker`
3. Ve a la pestaña **"Deploy"**
4. Haz click en el botón **"CLI"** (esquina inferior derecha)
5. Copia y pega en la terminal que aparece:
```bash
npm run migrate
```
6. Presiona Enter
7. Espera a ver "✓ Migraciones completadas"

### Paso 4: Verificar que funciona

1. En Railway, copia tu URL (ej: `ceap-tracker-production.up.railway.app`)
2. Abre en navegador
3. Deberías ver el **dashboard con 25 planteles**
4. Haz click en un plantel
5. Debería abrir detalles
6. Puedes editar fases

✅ **Listo!** Tu aplicación está en vivo.

---

## 💻 SCENARIO B: Desarrollo Local (Tu PC)

**¿Qué es?** Trabajar en tu computadora antes de publicar.

### Paso 1: Instalar PostgreSQL

**Windows**: Descargar de https://www.postgresql.org/download/windows/
- Durante la instalación, recuerda la contraseña del usuario `postgres`

**Mac**: 
```bash
brew install postgresql
brew services start postgresql
```

**Linux** (Ubuntu/Debian):
```bash
sudo apt-get install postgresql postgresql-contrib
```

### Paso 2: Crear la base de datos

En terminal:
```bash
createdb ceap_tracker
```

### Paso 3: Configurar variables de entorno

Crea archivo `server/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_NAME=ceap_tracker
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Nota**: Reemplaza `tu_contraseña_de_postgres` con la que pusiste al instalar PostgreSQL.

### Paso 4: Ejecutar migraciones (LOCAL)

En tu **terminal, en la carpeta raíz del proyecto**:
```bash
npm run migrate
```

Esto crea todas las tablas.

### Paso 5: Iniciar el servidor

En tu **terminal, en la carpeta raíz**:
```bash
npm run install-all
```

Esto instala todas las dependencias.

Luego, abre **DOS terminales**:

**Terminal 1 (Backend)**:
```bash
cd server
npm run dev
```

Deberías ver: `Server running on port 5000`

**Terminal 2 (Frontend)**:
```bash
cd client
npm start
```

Deberías ver: `Compiled successfully!` y se abre http://localhost:3000

### Paso 6: Usar la aplicación

- Haz click en planteles
- Edita fechas y estatus
- Los datos se guardan en PostgreSQL (tu PC)
- Recarga la página → Los datos persisten

---

## 🔄 Flujo de Actualización (Ambos escenarios)

### Si estás en desarrollo local:
1. Editas código
2. Guardas
3. El servidor se recarga automáticamente (hot reload)
4. Ve a http://localhost:3000 → Verás los cambios

### Si estás en producción (Railway):
1. Editas código en tu PC
2. En tu **terminal local**:
```bash
git add -A
git commit -m "tu-cambio"
git push origin main
```
3. Railway detecta el cambio y automáticamente:
   - Reconstruye el cliente
   - Reinicia el servidor
4. En 1-2 minutos están los cambios en vivo

---

## 📊 Tabla Rápida: ¿Dónde ejecuto cada cosa?

| Comando | Entorno | Ubicación |
|---------|---------|-----------|
| `git push` | Ambos | Terminal local (tu PC) |
| `npm run migrate` | Desarrollo | Terminal local (tu PC) |
| `railway run npm run migrate` | Producción | Terminal local O Panel Railway |
| `npm run install-all` | Desarrollo | Terminal local (tu PC) |
| `npm run dev` (server) | Desarrollo | Terminal local (tu PC) |
| `npm start` (client) | Desarrollo | Terminal local (tu PC) |
| Editar código | Ambos | Tu editor (VS Code) |

---

## ✅ Checklist de Verificación

### Después de deploy en Railway:
- [ ] La URL de Railway está accesible
- [ ] El dashboard carga (muestra "Cargando..." si no hay datos)
- [ ] Ejecutaste `railway run npm run migrate`
- [ ] El dashboard ahora muestra 25 planteles
- [ ] Haces click en un plantel y abre detalles
- [ ] Puedes editar una fase
- [ ] Guardas cambios
- [ ] Recargas la página (F5) y los cambios persisten

### Para desarrollo local:
- [ ] PostgreSQL instalado y `createdb ceap_tracker` ejecutado
- [ ] Archivo `server/.env` creado
- [ ] `npm run migrate` ejecutado sin errores
- [ ] `npm run install-all` completó
- [ ] Terminal 1: Server en http://localhost:5000
- [ ] Terminal 2: Client en http://localhost:3000
- [ ] Dashboard carga con 25 planteles
- [ ] Puedes editar datos y persisten

---

## 🆘 Problemas Comunes

### "Error: Cannot find module 'pg'"
→ No instalaste dependencias
```bash
npm run install-all
```

### "Error: ECONNREFUSED 127.0.0.1:5432"
→ PostgreSQL no está corriendo
```bash
# Mac
brew services start postgresql

# Windows
# Abre Services (services.msc) y busca postgresql
```

### "Dashboard muestra 'Cargando...' infinito"
→ No ejecutaste migraciones
```bash
# Local
npm run migrate

# Railway
railway run npm run migrate
```

### "Error: connect ENOTFOUND ceap-tracker-production"
→ No hiciste push a GitHub o Railway aún no desplegó
```bash
git push origin main
# Espera 2-3 minutos
```

---

## 📞 Resumen Final

**Recuerda**: Los comandos se ejecutan en **diferentes lugares** según dónde estés:

- 🖥️ **Tu PC (Terminal local)**: `git push`, `npm install`, `npm run migrate`, `npm start`
- ☁️ **Railway (Online)**: Automático cuando haces `git push`, O `railway run` desde tu PC

¡Cualquier duda, revisa el README.md! 🚀
