# HurData - Frontend

**HurData** es un Dashboard Analítico de Gestión Académica diseñado para procesar, depurar y visualizar los datos operativos exportados por el sistema SIU Guaraní. Desarrollado en el ámbito del Instituto de Tecnología e Ingeniería de la Universidad Nacional de Hurlingham (UNaHur), el proyecto busca transformar reportes tabulares estáticos en información estratégica e interactiva.

Este repositorio es el frontend: una aplicación React que consume la API del [backend](https://github.com/HurData-UNaHur/hurdata-pip-backend), donde corre el pipeline ETL (Python, Pandas y FastAPI) que limpia los Excel del SIU.

### ✨ Características Principales
* **Dashboard de fin de cursada:** KPIs, distribución de estados por materia y alertas de riesgo, filtrables por período, carrera, materia y modalidad.
* **Análisis de materias filtro:** ranking de materias por porcentaje de libres, con indicador de riesgo.
* **Evolución entre períodos:** gráfico de tendencia de una carrera o materia, con selector de períodos, y tabla comparativa de dos períodos con variaciones y alertas.
* **Exportación:** las tablas de Materias y de la comparativa de Evolución se descargan como CSV (se abre en Excel) o PDF, respetando el filtro y el orden que se ven en pantalla.
* **Carga de Excel e historial:** los usuarios con permiso suben los reportes del SIU y consultan quién cargó cada uno.
* **Simulador de comisiones:** estima cuántas comisiones abrir a partir de los libres, con la tasa de recursado y el cupo que elige quien lo usa. Tiene topes de seguridad (tasa de 20 % a 100 %, cupo de 10 a 100 alumnos).
* **Sesión y roles:** login con JWT; lo que se puede hacer depende del rol (ver más abajo). Hay que iniciar sesión para usar la aplicación: no hay modo invitado. Las personas nuevas piden acceso y un directivo o administrador lo aprueba; para recuperar la contraseña piden un código que también entrega un directivo o administrador.
* **Mi cuenta:** cada persona ve sus datos (nombre, correo, rol e instituto) y cambia su contraseña. Pide la actual y, tras 5 errores seguidos, bloquea el cambio 15 minutos.
* **Accesos:** sección con tres pestañas. *Solicitudes* (registros y recuperaciones pendientes), *Historial* (solicitudes resueltas) y *Cuentas* (cambiar el rol, revocar y reactivar accesos, solo Admin). La barra lateral muestra cuántas solicitudes hay pendientes.
* **Ayudas en pantalla:** cada pantalla tiene un panel «¿Cómo se lee?» y los indicadores explican qué miden.
* **Accesibilidad:** título por pantalla, enlace para saltar al contenido, campos con etiqueta, navegación con teclado y contraste revisado.
* **Tema claro y oscuro.**

---

## Roles y permisos

Los permisos vienen en el token que entrega el backend y definen qué botones se muestran. El backend vuelve a validar cada acción, así que ocultar un botón no es una medida de seguridad.

| Rol | Qué puede hacer |
|---|---|
| Admin | Todo: cargar, borrar cualquier carga, ver todo el historial, vaciar la base, aprobar solicitudes y gestionar cuentas |
| Directivo | Cargar, borrar cualquier carga, ver todo el historial y aprobar solicitudes. Ve el historial de solicitudes de su instituto |
| Docente | Cargar, y borrar o reemplazar solo lo que cargó él. Ve su propio historial |
| No Docente | Solo consulta |

La definición completa está en `app/api/permisos.py` del backend.

## 🗂️ Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── AppShell        # Cabecera, barra lateral, contenido y footer
│   ├── Filters, KpiCard, AlertsPanel, StackedBarChart
│   ├── GraficoEvolucion, FiltroPeriodos, TablaComparativa, AvisoParcial
│   ├── BotonesExportar # Botones CSV y PDF de las tablas
│   ├── Tooltip, Pp, AyudaPantalla, ModalConfirmar, ToastProvider, Segmentado
│   └── Campo, AuthLayout, EstadoVacio, OrigenDatos, IconoTema
├── pages/              # Vistas principales
│   ├── Dashboard.jsx   # KPIs, distribución por materia y filtros
│   ├── Materias.jsx    # Análisis comparativo de materias filtro (exportable)
│   ├── Predicciones.jsx# Simulador de comisiones (recursantes y apertura de comisiones)
│   ├── Evolucion.jsx   # Gráfico de tendencia y comparación de dos períodos
│   ├── Cargas.jsx      # Subida de Excel e historial de cargas
│   ├── Accesos.jsx     # Solicitudes, historial y cuentas (pestañas en pages/accesos/)
│   ├── Cuenta.jsx      # Mi cuenta: datos y cambio de contraseña
│   └── Login.jsx, Registro.jsx, RecuperarPassword.jsx
├── services/api.js     # Llamadas al backend, sesión (JWT) y permisos
├── utils/              # transformData, comparar, evolucion, umbrales, simulador, validaciones, ayuda, texto, exportar
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

**Accesos.** Quien puede aprobar registros (Directivo y Admin) ve «Accesos» en la barra lateral, con el número de solicitudes pendientes. En la pestaña *Solicitudes* aprueba o rechaza las altas (pudiendo cambiar el rol) y los pedidos de recuperación. Al aprobar una recuperación, la pantalla muestra un código de un solo uso que hay que pasarle a la persona; vale 60 minutos y no se vuelve a mostrar, así que hay que anotarlo antes de salir de la pantalla. Las cuentas Admin y Directivo solo las restablece un Admin, y nadie aprueba la propia solicitud.

*Historial* lista las solicitudes ya resueltas, aprobadas y rechazadas: el Admin ve todas y un Directivo, las de su instituto. *Cuentas* (solo Admin) permite cambiar el rol de otra persona y revocar o reactivar su acceso. Una cuenta revocada no puede iniciar sesión y su sesión abierta se cierra. Nadie puede modificar su propia cuenta.

Las cuentas precargadas no tienen instituto, salvo directivo@, que pertenece a Tecnología e Ingeniería. Para ver el instituto en **Mi cuenta** hay que registrar una cuenta nueva y aprobarla.

**Reglas de los formularios.** El correo debe ser `nombre@unahur.edu.ar`. La contraseña nueva tiene al menos 8 caracteres, con mayúscula, minúscula, número y símbolo, y distinta de la anterior. Los errores aparecen al salir de un campo y se actualizan mientras se escribe; el ingreso solo pide que los campos no estén vacíos. Las reglas están en `src/utils/validaciones.js` y se repiten en el backend, que es quien las hace cumplir. El cambio de contraseña desde **Mi cuenta** pide la contraseña actual y limita los intentos (5 errores seguidos bloquean el cambio 15 minutos).

**Simulador de comisiones.** La tasa de recursado va de 20 % a 100 % y el cupo por comisión de 10 a 100 alumnos. Si se escribe un cupo fuera de rango, el cálculo usa el límite más cercano y la pantalla avisa. Los topes están en `src/utils/simulador.js`.

## Pruebas

El frontend se valida con `npm run lint` y `npm run build`. Las pruebas automáticas están en el backend: 35 tests con pytest que cubren login, permisos, carga y borrado de Excel, registro y recuperación de contraseña, Mi cuenta, límite de intentos, migración de la base, gestión de cuentas e historial de solicitudes (ver el README del backend).

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
| `POST /api/registro/solicitar` | Pedir acceso |
| `GET /api/registro/solicitudes`, `POST /api/registro/solicitudes/{id}/{aprobar\|rechazar}` | Accesos, pestaña Solicitudes: altas (Directivo y Admin) |
| `GET /api/registro/historial` | Accesos, pestaña Historial (Admin: todas; Directivo: las de su instituto) |
| `POST /api/recuperar-password/solicitar`, `POST /api/recuperar-password/canjear` | Recuperación de contraseña con código |
| `GET /api/recuperacion/solicitudes`, `POST /api/recuperacion/solicitudes/{id}/{aprobar\|rechazar}` | Accesos, pestaña Solicitudes: recuperaciones (Directivo y Admin) |
| `GET /api/perfil`, `POST /api/perfil/cambiar-password` | Mi cuenta |
| `GET /api/usuarios`, `POST /api/usuarios/{usuario}/rol`, `POST /api/usuarios/{usuario}/estado` | Accesos, pestaña Cuentas (solo Admin) |

La documentación completa de la API está en el README del backend y en `http://localhost:8000/docs`.
