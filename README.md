# TuOficio

**Plataforma web para conectar clientes con profesionales de oficios (plomeros, electricistas, pintores y más).**

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Deployed on Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?style=flat&logo=railway&logoColor=white)](https://railway.app/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](#-licencia)

[Demo en vivo](#-demo-en-vivo) · [Reportar un bug](../../issues) · [Solicitar una funcionalidad](../../issues)

</div>

---

##  Tabla de contenidos

- [Descripción](#-descripción)
- [Capturas de pantalla](#-capturas-de-pantalla)
- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [API — Endpoints principales](#-api--endpoints-principales)
- [Instalación y uso local](#-instalación-y-uso-local)
- [Variables de entorno](#-variables-de-entorno)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Autor](#-autor)

---

## Descripción

**TuOficio** es una plataforma web que resuelve un problema muy común: encontrar y contactar profesionales de oficios de confianza (electricistas, plomeros, pintores, carpinteros, etc.) de forma rápida y verificada.

La aplicación permite a los **clientes** buscar y calificar profesionales, y a los **profesionales** crear un perfil público, gestionar su información y recibir reseñas de sus trabajos, todo respaldado por un sistema de autenticación seguro.

## Capturas de pantalla

> _Agrega aquí 2-4 capturas (inicio, búsqueda de profesionales, perfil público y formulario de registro). Guárdalas en `assets/screenshots/` y enlázalas así:_

| Inicio | Búsqueda de profesionales | Registro |
|---|---|---|
| Inicio <img width="542" height="526" alt="image" src="https://github.com/user-attachments/assets/80bd0537-07ae-452d-8e30-5f77d681b6f6" /> | Búsqueda <img width="542" height="526" alt="image" src="https://github.com/user-attachments/assets/d802d754-9ff3-4ab8-af4b-b497183a1f55" /> | Registro <img  width="542" height="526" alt="image" src="https://github.com/user-attachments/assets/38f7261d-e393-4e4b-a30f-423912364307" />



## Características

-  **Autenticación** de usuarios y profesionales (registro, login y recuperación de contraseña) vía Supabase Auth.
-  **Búsqueda y listado de profesionales** por oficio.
-  **Perfiles públicos de profesionales**, editables por su dueño una vez autenticado.
-  **Sistema de reseñas** para calificar el trabajo de cada profesional.
-  **Carga de fotos de perfil** (usuarios y profesionales) mediante `multer`.
-  **API REST** protegida con middleware de verificación de token.
-  Interfaz responsive construida con HTML, CSS y JavaScript puro (sin frameworks pesados en el cliente).

##  Stack tecnológico

**Frontend**
- HTML5, CSS3 y JavaScript (ES Modules) — sin frameworks, enfocado en rendimiento y simplicidad.

**Backend**
- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- [Supabase](https://supabase.com/) (base de datos, autenticación y almacenamiento)
- [Multer](https://github.com/expressjs/multer) para manejo de archivos/imágenes
- [CORS](https://www.npmjs.com/package/cors) y [dotenv](https://www.npmjs.com/package/dotenv)
- [Nodemon](https://nodemon.io/) en entorno de desarrollo

## Arquitectura

```
Cliente (HTML/CSS/JS)  ─────HTTP/JSON────▶  Express API (Backend/)  ─────▶  Supabase
     Navegador                              Controllers + Routes           (Auth · DB · Storage)
```

El servidor Express sirve tanto los **archivos estáticos del frontend** como la **API REST** bajo el prefijo `/api`, simplificando el despliegue en un único servicio.

## Estructura del proyecto

```
TuOficio/
├── Backend/
│   ├── app.js                  # Punto de entrada del servidor Express
│   ├── config/
│   │   └── supabase.js         # Cliente de Supabase
│   ├── controllers/            # Lógica de negocio por recurso
│   │   ├── auth.controller.js
│   │   ├── profesionales.controller.js
│   │   ├── reviews.controller.js
│   │   └── usuarios.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js  # Verificación de token (Supabase Auth)
│   ├── routes/                 # Definición de endpoints
│   │   ├── auth.routes.js
│   │   ├── profesionales.routes.js
│   │   ├── reviews.routes.js
│   │   └── usuarios.routes.js
│   └── package.json
├── assets/                     # Imágenes y recursos estáticos
├── js/                         # Lógica del frontend (auth, búsqueda, perfiles, etc.)
├── pages/                      # Vistas HTML (login, búsqueda, perfiles, ayuda, legal...)
├── style/                      # Hojas de estilo por página
└── index.html                  # Página principal
```

## 🔌 API — Endpoints principales

Todos los endpoints están bajo el prefijo `/api`. Las rutas marcadas con requieren un token válido (`Authorization: Bearer <token>`).

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/registro/usuario` | Registra un nuevo cliente |
| POST | `/registro/profesional` | Registra un nuevo profesional |
| POST | `/login` | Inicia sesión |
| POST | `/recuperar-password` | Recuperación de contraseña |

### Profesionales (`/api/profesionales`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Lista todos los profesionales |
| GET | `/:id` | Obtiene un profesional por ID |
| PUT  | `/:id` | Actualiza el perfil de un profesional |
| POST  | `/:id/foto` | Sube/actualiza la foto de perfil |

### Reseñas (`/api/reviews`)
| Método | Endpoint | Descripción |
|---|---|---|
| POST  | `/` | Crea una reseña |
| GET | `/:profesional_id` | Lista las reseñas de un profesional |

### Usuarios (`/api/usuarios`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/:id` | Obtiene un usuario por ID |
| PUT  | `/:id` | Actualiza los datos de un usuario |
| POST  | `/:id/foto` | Sube/actualiza la foto del usuario |

##  Instalación y uso local

### Requisitos previos
- [Node.js](https://nodejs.org/) v18 o superior
- Una cuenta y proyecto en [Supabase](https://supabase.com/)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/HellKaiser09/TuOficio.git
cd TuOficio

# 2. Instala las dependencias del backend
cd Backend
npm install

# 3. Crea el archivo de variables de entorno
cp .env.example .env   # y completa tus credenciales de Supabase

# 4. Levanta el servidor en modo desarrollo
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`, sirviendo tanto el frontend como la API (`http://localhost:3000/api`).

>  Si solo quieres trabajar en el frontend, puedes abrir `index.html` directamente, pero necesitarás el backend corriendo para que las llamadas a la API funcionen (revisa `js/config.js`).

##  Variables de entorno

Crea un archivo `.env` dentro de `Backend/` con las siguientes variables:

```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
```
## Roadmap

- [ ] Panel de administración para moderar reseñas
- [ ] Filtros de búsqueda avanzados (ubicación, calificación, disponibilidad)
- [ ] Sistema de mensajería interna cliente–profesional
- [ ] Notificaciones por correo
- [ ] Tests automatizados (unitarios e integración)
- [ ] Documentación de la API con Swagger/OpenAPI

## 👤 Autor

**HellKaiser09**

- GitHub: [@HellKaiser09](https://github.com/HellKaiser09)
---

<div align="center">

Si este proyecto te resultó útil, ¡considera darle una ⭐ en GitHub!

</div>
