# HurData - Frontend

**HurData** es un Dashboard Analítico de Gestión Académica diseñado para procesar, depurar y visualizar los datos operativos exportados por el sistema SIU Guaraní. Desarrollado en el ámbito del Instituto de Tecnología e Ingeniería de la Universidad Nacional de Hurlingham (UNaHur), el proyecto busca transformar reportes tabulares estáticos en información estratégica e interactiva.

Este repositorio es el frontend: una aplicación React que consume la API del [backend](https://github.com/HurData-UNaHur/hurdata-pip-backend), donde corre el pipeline ETL (Python, Pandas y FastAPI) que limpia los Excel del SIU.

### ✨ Características Principales
* **Dashboard de fin de cursada:** KPIs, distribución de estados por materia y alertas de riesgo, filtrables por período, carrera, materia y modalidad.
* **Análisis de materias filtro:** ranking de materias por porcentaje de libres, con indicador de riesgo.
* **Evolución entre períodos:** gráfico de tendencia de una carrera o materia, con selector de períodos, y tabla comparativa de dos períodos con variaciones y alertas.
* **Exportación:** las tablas de Materias y de la comparativa de Evolución se descargan como CSV (se abre en Excel) o PDF, respetando el filtro y el orden que se ven en pantalla.
* **Carga de Excel e historial:** los usuarios con permiso suben los reportes del SIU y consultan quién cargó cada uno.
* **Sesión y roles:** login con JWT; lo que se puede hacer depende del rol (ver más abajo). Sin sesión se puede consultar en modo invitado.
* **Tema claro y oscuro.**

---

## Roles y permisos

Los permisos vienen en el token que entrega el backend y definen qué botones se muestran. El backend vuelve a validar cada acción, así que ocultar un botón no es una medida de seguridad.

| Rol | Qué puede hacer |
|---|---|
| Admin | Todo: cargar, borrar cualquier carga, ver todo el historial y vaciar la base |
| Directivo | Cargar, borrar cualquier carga y ver todo el historial |
| Docente | Cargar, y borrar o reemplazar solo lo que cargó él. Ve su propio historial |
| No Docente | Solo consulta |
| Invitado (sin sesión) | Solo consulta de períodos, carreras, datos y evolución |

La definición completa está en `app/api/permisos.py` del backend.

## 🗂️ Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── Navbar, Filters, KpiCard, AlertsPanel, StackedBarChart, ProjectionSlider
│   ├── GraficoEvolucion, SelectorPeriodos, TablaComparativa, AvisoParcial
│   ├── BotonesExportar # Botones CSV y PDF de las tablas
│   └── EstadoVacio, OrigenDatos, IconoTema
├── pages/              # Vistas principales
│   ├── Dashboard.jsx   # KPIs, distribución por materia y filtros
│   ├── Materias.jsx    # Análisis comparativo de materias filtro (exportable)
│   ├── Predicciones.jsx# Proyección de recursantes y apertura de comisiones
│   ├── Evolucion.jsx   # Gráfico de tendencia y comparación de dos períodos
│   ├── Cargas.jsx      # Subida de Excel e historial de cargas
│   └── Login.jsx, Registro.jsx, RecuperarPassword.jsx
├── services/api.js     # Llamadas al backend, sesión (JWT) y permisos
├── utils/              # transformData, comparar, evolucion, umbrales, texto, exportar
├── App.jsx             # Enrutamiento (React Router) y estado general
└── main.jsx            # Punto de entrada de la aplicación
```

## Requisitos Previos
* Node.js 18 o superior.
* Git.
* El backend corriendo (ver su README), por defecto en `http://localhost:8000`.

## Configuración del Entorno Local (Setup)

**1. Clonar el repositorio**
```bash
git clone https://github.com/HurData-UNaHur/hurdata-pip-frontend.git
cd hurdata-pip-frontend
```

**2. Instalar las dependencias**
```bash
npm install
```

**3. Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`. Ese origen ya está permitido por defecto en el CORS del backend.

### Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:8000` |

Para cambiarla, crear un archivo `.env` en la raíz del frontend con `VITE_API_URL=<url>`. En producción hay que sumar el origen del frontend a `CORS_ORIGINS` del backend.

## Cómo probarlo

El backend precarga cuatro usuarios, uno por rol: `admin@`, `directivo@`, `docente@` y `nodocente@` más `unahur.edu.ar`. La contraseña es la de `SEED_DEFAULT_PASSWORD` del backend. Con un usuario que pueda cargar, subir un Excel del SIU desde **Cargas**. Si todavía no hay datos, las pantallas muestran un estado vacío que lo indica.

La sesión (token y datos del usuario) se guarda en `localStorage` y dura 8 horas. Al vencer, se vuelve al login.

> El registro de usuarios y la recuperación de contraseña tienen pantalla, pero el backend todavía no tiene esos endpoints.

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Genera el bundle de producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta ESLint sobre el código fuente |

## Dependencias Principales

| Librería | Versión | Uso |
|---|---|---|
| React | ^19 | Librería principal de UI |
| React Router DOM | ^7 | Enrutamiento entre vistas |
| Recharts | ^3 | Gráficos interactivos |
| lucide-react | ^1 | Íconos |
| jsPDF y jspdf-autotable | ^4 y ^5 | Exportación de tablas a PDF (se cargan recién al exportar) |
| Vite | ^8 | Bundler y servidor de desarrollo |

## Conexión con el Backend

Todas las pantallas leen datos reales de la API: no quedan datos de ejemplo. Los endpoints que usa el frontend son:

| Endpoint | Uso |
|---|---|
| `POST /api/login` | Inicio de sesión |
| `GET /api/periodos`, `/api/carreras`, `/api/datos` | Dashboard, Materias y Predicciones |
| `GET /api/evolucion` | Página Evolución |
| `GET /api/periodos-carreras`, `/api/carga-activa` | Origen de los datos (requiere sesión) |
| `GET /api/cargas` | Historial en Cargas |
| `POST /upload` | Subir un Excel (con `?reemplaza=` para una nueva versión) |
| `DELETE /api/periodos/{id}` | Borrar una carga |
| `DELETE /api/limpiar-db` | Vaciar la base (solo Admin) |
| `GET /api/institutos` | Selector de instituto en el registro |

La documentación completa de la API está en el README del backend y en `http://localhost:8000/docs`.
