# CEaP Tracker - Sistema de Seguimiento CEaP

Un sistema integral para el seguimiento de la creación y actualización del Centro de Enseñanza y Aprendizaje Práctico (CEaP) en los 25 planteles de DGETI Guanajuato.

## 🎯 Características

- **Dashboard Intuitivo**: Visualiza el estatus de todos los CEaP en tiempo real
- **Seguimiento de 7 Fases**: Convocatoria, Asambleas, Actas, Acta Protocolizada, Registro Público, SAT, Cuenta Bancaria
- **Gestión por Plantel**: Cada plantel puede actualizar el estatus de sus fases
- **Cálculo Automático**: Porcentaje de avance global y por plantel
- **Exportación de Datos**: Descarga reportes en CSV y Excel
- **Ciclos CEaP**: Soporte para ciclos de 2 años (2024-2026, 2025-2027, etc.)
- **PostgreSQL**: Base de datos robusta y escalable
- **Interfaz Moderna**: Diseño intuitivo y responsive

## 🚀 Inicio Rápido (Railway)

### Opción 1: Deploy Automático desde GitHub

1. **Sube el código a GitHub**
```bash
git push origin main
```

2. **Conecta Railway**
   - Ve a https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Selecciona `ceap-tracker`

3. **Railway automáticamente**:
   - ✅ Instala dependencias (server + client)
   - ✅ Compila el cliente React
   - ✅ Crea PostgreSQL
   - ✅ Inicia el servidor
   - ✅ Sirve el frontend en `/`

4. **⚠️ IMPORTANTE: Ejecutar migraciones (Primera vez)

   Las migraciones crean las tablas en PostgreSQL. Ejecuta **EN RAILWAY**:
   
   ```bash
   railway run npm run migrate
   ```
   
   O en el Panel de Railway:
   - Abre tu proyecto
   - Click en servicio `ceap-tracker`
   - Pestaña "Deploy" → Click "CLI"
   - Ejecuta: `npm run migrate`

5. **¡Listo!** Dashboard cargará con 25 planteles

### Opción 2: Desarrollo Local

```bash
# Clonar y instalar
npm run install-all

# Crear BD local
createdb ceap_tracker

# Variables de entorno (server/.env)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=ceap_tracker
PORT=5000
NODE_ENV=development

# Ejecutar migraciones (LOCAL)
npm run migrate

# Iniciar en desarrollo (dos terminales)
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm start
```

Abre http://localhost:3000

---

## 📌 Recordatorio: ¿Dónde ejecutar migraciones?

| Entorno | Comando | Ubicación |
|---------|---------|-----------|
| **Railway (Producción)** | `railway run npm run migrate` | Terminal local O Panel Railway |
| **Desarrollo Local** | `npm run migrate` | Terminal en tu PC |

**Nunca** ejecutes las migraciones de desarrollo en producción. Railway ejecuta automáticamente migraciones si lo necesita.

---

## 📋 Estructura del Proyecto

```
ceap-tracker/
├── server/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── server.js       # Sirve API + frontend
│   │   ├── routes/         # Rutas API
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── models/         # Acceso a datos
│   │   ├── services/       # Servicios (exportación)
│   │   └── config/         # Configuración BD
│   ├── migrations/         # Scripts SQL
│   └── package.json
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/          # Dashboard, Detalle
│   │   ├── components/     # Componentes reutilizables
│   │   ├── services/       # Cliente HTTP
│   │   ├── styles/         # CSS
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── package.json            # Orquestación
├── railway.json            # Configuración Railway
├── Procfile               # Definición de procesos
├── README.md              # Este archivo
├── DEPLOY_QUICK.md        # Guía de deploy
└── USAGE.md              # Guía de uso
```

---

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-----------|
| **planteles** | 25 planteles DGETI Guanajuato |
| **ceaps** | CEaPs por plantel (2024-2026, 2025-2027, etc.) |
| **fases** | 7 fases del proceso CEaP |
| **ceap_fases** | Estado de cada fase |
| **ceap_fases_historial** | Auditoría de cambios |

### En Railway

PostgreSQL se **crea automáticamente**:
- Variable: `DATABASE_URL`
- Acceso automático desde el código
- Backups automáticos
- Escalable y seguro

---

## 📡 API REST

### Planteles
```
GET    /api/planteles          # Listar todos
GET    /api/planteles/:id      # Obtener uno
POST   /api/planteles          # Crear
PUT    /api/planteles/:id      # Actualizar
```

### CEaP
```
GET    /api/ceaps/dashboard           # Dashboard
GET    /api/ceaps/plantel/:id         # Por plantel
GET    /api/ceaps/:ceapId/fases       # Fases
POST   /api/ceaps                     # Crear
PUT    /api/ceaps/fases/:ceapFaseId   # Actualizar fase
```

### Exportación
```
GET    /api/export/csv         # Exportar CSV
GET    /api/export/excel       # Exportar Excel
GET    /api/export/ceap/:id/csv  # Detalle CSV
```

---

## 🎨 Frontend

### Dashboard
- Vista general de 25 planteles
- Estadísticas globales
- Tarjetas con avance
- Botones de exportación
- Click para ver detalles

### Detalle de Plantel
- Información del director
- Selector de ciclo
- 7 fases editables
- Campos: Estado, Fechas, Observaciones
- Guardar automático
- Exportar detalle

### Cálculo de Avance
```
Avance = (Fases Completadas / 7) × 100
```
Se actualiza automáticamente al editar.

---

## 🔧 Comandos

### Desarrollo
```bash
npm run install-all          # Instalar todo
npm run dev                  # Servidor + cliente
npm run build               # Build solo cliente
npm run migrate            # Ejecutar migraciones
```

### Server
```bash
cd server
npm run dev                # Desarrollo (nodemon)
npm start                  # Producción
npm run migrate           # Migraciones BD
```

### Client
```bash
cd client
npm start                 # Desarrollo
npm run build            # Compilar para producción
```

---

## 🚀 Deployment

### En Railway (Recomendado)

1. Push a GitHub:
```bash
git push origin main
```

2. Railway detecta automáticamente y:
   - Instala dependencias
   - Compila el cliente
   - Crea PostgreSQL
   - Inicia el servidor

3. Ejecutar migraciones (primera vez):
```bash
railway run npm run migrate
```

4. ¡Listo! Tu app está en vivo

Ver detalles en [DEPLOY_QUICK.md](DEPLOY_QUICK.md)

### Variables de Entorno (Railway)

Railway proporciona automáticamente:
- ✅ `DATABASE_URL` - PostgreSQL
- ✅ `PORT` - Puerto de escucha

No necesitas configurar manualmente.

---

## 📊 Las 7 Fases del CEaP

1. **Convocatoria** - Publicación y difusión
2. **Asambleas** - Reuniones informativas
3. **Actas** - Documentos de acuerdos
4. **Acta Protocolizada** - Notarización
5. **Registro Público** - Registro oficial
6. **SAT** - FIEL y cambio de socios
7. **Cuenta Bancaria** - Nuevo cuenta o cambio

---

## 🔐 Seguridad

- ✅ CORS configurado
- ✅ Variables de entorno protegidas
- ✅ PostgreSQL con credenciales seguras
- ✅ Validación de entrada
- ✅ Manejo de errores robusto

---

## 📈 Escalabilidad

El sistema está diseñado para:
- 25 planteles
- Múltiples ciclos por plantel
- Cientos de usuarios simultáneos
- Datos históricos
- Exportaciones masivas

Railway automatiza:
- Escalado horizontal
- Backups automáticos
- Monitoreo
- Logs en tiempo real

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js, Express, PostgreSQL |
| **Frontend** | React, CSS |
| **Deploy** | Railway, Docker, Nixpacks |
| **Base de Datos** | PostgreSQL (Railway) |

---

## 📞 Soporte

- Documentación: [USAGE.md](USAGE.md)
- Deploy: [DEPLOY_QUICK.md](DEPLOY_QUICK.md)
- Railway: https://docs.railway.app
- GitHub Issues: Crear issue en el repo

---

## 📄 Licencia

© 2026 DGETI Guanajuato - Sistema de Seguimiento CEaP

---

## 🎯 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Notificaciones por email
- [ ] Gráficos estadísticos
- [ ] Importar datos desde Excel
- [ ] Galería de documentos
- [ ] API de webhooks
- [ ] Dark mode
- [ ] Mobile app

---

**¡Bienvenido a CEaP Tracker!** 🚀


## Estructura del Proyecto

```
ceap-tracker/
├── server/              # Backend Node.js + Express
│   ├── src/
│   │   ├── config/      # Configuración de base de datos
│   │   ├── routes/      # Rutas de API
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── models/      # Modelos de datos
│   │   ├── services/    # Servicios (exportación, etc.)
│   │   └── server.js    # Entrada principal
│   ├── migrations/      # Scripts de base de datos
│   └── package.json
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/       # Páginas (Dashboard, Detalle)
│   │   ├── components/  # Componentes reutilizables
│   │   ├── services/    # Servicios API
│   │   ├── styles/      # Estilos CSS
│   │   ├── App.js       # Componente principal
│   │   └── index.js     # Entrada
│   └── package.json
└── README.md
```

## Requisitos

- Node.js v16+
- PostgreSQL 12+
- npm o yarn

## Instalación Local

### 1. Backend

```bash
cd server
npm install
```

Crear archivo `.env`:
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

Ejecutar migraciones:
```bash
npm run migrate
```

Iniciar servidor:
```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
```

Crear archivo `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Iniciar desarrollo:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Despliegue en Railway

### 1. Preparar repositorio

```bash
# Inicializar git si no existe
git init
git add .
git commit -m "Initial commit"
```

### 2. Conectar a Railway

1. Ve a [railway.app](https://railway.app)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Conecta tu repositorio GitHub
5. Railway detectará automáticamente que es un proyecto monorepo

### 3. Configuración de variables de entorno

En Railway:

```
# Database
DATABASE_URL=postgresql://[usuario]:[contraseña]@[host]:[puerto]/ceap_tracker

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://tu-dominio.railway.app
```

### 4. Scripts de despliegue

El `package.json` del server incluye:
- `npm start`: Inicia el servidor
- `npm run migrate`: Ejecuta migraciones

Railway ejecutará estas automáticamente.

## API Endpoints

### Planteles
- `GET /api/planteles` - Obtener todos los planteles
- `GET /api/planteles/:id` - Obtener plantel por ID
- `POST /api/planteles` - Crear plantel
- `PUT /api/planteles/:id` - Actualizar plantel

### CEaP
- `GET /api/ceaps/dashboard` - Obtener datos del dashboard
- `GET /api/ceaps/plantel/:plantelId` - Obtener CEaPs de un plantel
- `GET /api/ceaps/:ceapId/fases` - Obtener fases de un CEaP
- `POST /api/ceaps` - Crear CEaP
- `PUT /api/ceaps/fases/:ceapFaseId` - Actualizar fase

### Exportación
- `GET /api/export/csv` - Exportar dashboard como CSV
- `GET /api/export/excel` - Exportar dashboard como Excel
- `GET /api/export/ceap/:ceapId/csv` - Exportar detalle como CSV

## Base de Datos

### Tablas principales

**planteles**: Información de los 25 planteles
- id, nombre, código, estado, municipio, director_email, director_nombre, etc.

**ceaps**: Registros de CEaP por plantel y ciclo
- id, plantel_id, ciclo_inicio, ciclo_fin, porcentaje_avance, estado

**fases**: Definición de las 7 fases
- id, nombre, descripcion, numero_orden

**ceap_fases**: Estado de cada fase para cada CEaP
- id, ceap_id, fase_id, estado, fecha_conclusión, fecha_estimada, completado, observaciones

**ceap_fases_historial**: Auditoría de cambios
- id, ceap_fase_id, estado_anterior, estado_nuevo, fecha_cambio, usuario_email

## Ciclos CEaP Soportados

- 2024-2026
- 2025-2027
- 2026-2028
- Y así sucesivamente

## Estados de Fases

- `no_iniciado`: No se ha iniciado
- `en_progreso`: En proceso
- `completado`: Completado

## Cálculo de Avance

El porcentaje de avance se calcula automáticamente como:
```
(Fases Completadas / Total de Fases) * 100
```

Se actualiza cada vez que se modifica el estado de una fase.

## Interfaz de Usuario

### Dashboard
- Vista general de todos los planteles
- Tarjetas con información resumida
- Estadísticas globales
- Botones de exportación
- Clickeable para ver detalles de cada plantel

### Detalle de Plantel
- Información completa del plantel
- Selector de ciclo CEaP
- Lista editable de 7 fases
- Campos: Estado, Fecha Conclusión, Fecha Estimada, Observaciones
- Opción para marcar como completado
- Botón de exportación específica

## Paleta de Colores

- Primario: Azul (#3b82f6)
- Éxito: Verde (#10b981)
- Advertencia: Naranja (#f59e0b)
- Peligro: Rojo (#ef4444)
- Secundario: Gris (#6b7280)

## Próximas Mejoras

- Autenticación y autorización de usuarios
- Sistema de notificaciones por email
- Gráficos estadísticos avanzados
- Importación de datos desde Excel
- Galería de documentos adjuntos
- Reportes personalizados

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de DGETI Guanajuato.

---

© 2026 DGETI Guanajuato - Sistema de Seguimiento CEaP
