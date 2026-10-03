# HurData - Frontend

**HurData** es un Dashboard Analítico de Gestión Académica diseñado para procesar, depurar y visualizar los datos operativos exportados por el sistema SIU Guaraní. Desarrollado en el ámbito del Instituto de Tecnología e Ingeniería de la Universidad Nacional de Hurlingham (UNaHur), el proyecto busca transformar reportes tabulares estáticos en información estratégica e interactiva.

Los reportes nativos del sistema (como las estadísticas de fin de cursada) suelen exportarse con formatos visuales pensados para la lectura humana, lo que dificulta el análisis masivo y programático. HurData resuelve este cuello de botella mediante un pipeline ETL (Extracción, Transformación y Carga) construido en Python, Pandas y FastAPI, automatizando la limpieza de archivos y preparándolos para su consumo en la web.

### ✨ Características Principales
* **Motor de Procesamiento Dinámico:** Limpia y normaliza automáticamente archivos Excel crudos del SIU, aislando los datos reales de los metadatos visuales.
* **Arquitectura Modular Orientada a Objetos:** Código backend estructurado profesionalmente, separando responsabilidades para facilitar el testing, la escalabilidad y el trabajo ágil en equipo.
* **Privacidad por Diseño (Privacy-First):** Configuración estricta de repositorios y entornos para garantizar que los archivos con datos sensibles de la universidad nunca se expongan en la nube pública.
* **API RESTful:** Exposición de endpoints rápidos y documentados, optimizados para alimentar de forma directa los gráficos interactivos del frontend.

---

Frontend del Dashboard Analítico de Gestión Académica para la Universidad Nacional de Hurlingham (UNaHur). Desarrollado con React, Vite y Recharts.

## 🗂️ Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables (Navbar, KpiCard, Filters)
├── pages/              # Vistas principales de la aplicación
│   ├── Dashboard.jsx   # Panel de control con KPIs y filtros por materia/modalidad
│   ├── Materias.jsx    # Análisis comparativo de materias filtro
│   └── Predicciones.jsx# Proyección de recursantes y apertura de comisiones
├── App.jsx             # Enrutamiento principal con React Router
└── main.jsx            # Punto de entrada de la aplicación
```

## Requisitos Previos
* Node.js 18 o superior.
* Git.

## Configuración del Entorno Local (Setup)

**1. Clonar el repositorio**

Abrir la terminal y ejecutar:
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

La aplicación quedará disponible en `http://localhost:5173`.

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
| Axios | ^1 | Consumo de la API del backend |
| Vite | ^8 | Bundler y servidor de desarrollo |

## Conexión con el Backend

Este frontend consume la API REST provista por [hurdata-pip-backend](https://github.com/HurData-UNaHur/hurdata-pip-backend). Para el desarrollo local, el backend debe estar corriendo en `http://localhost:8000`.

Actualmente, las vistas utilizan datos mock representativos del SIU Guaraní mientras se integran los endpoints reales.
