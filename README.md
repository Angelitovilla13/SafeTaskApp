# SafeTaskApp

Aplicación web para gestión de tareas y proyectos personales, con autenticación segura y control de roles.

## Objetivo
SafeTaskApp está orientada a estudiantes y profesionales que necesitan organizar tareas de forma confiable.

## Alcance funcional (MVP)

### 1) Registro y autenticación segura
- Registro con correo y contraseña.
- Hash de contraseñas con **Argon2** (alternativa: bcrypt).
- Validación de formato de correo y verificación por email (en fase siguiente).
- Inicio/cierre de sesión con sesiones seguras (cookies `HttpOnly`, `Secure`, `SameSite`).

### 2) Roles y permisos
- **Administrador**:
  - Puede ver y gestionar todos los usuarios.
  - Puede ver y gestionar todas las tareas.
- **Usuario estándar**:
  - Puede crear, editar, eliminar y marcar tareas propias.
  - No puede acceder a tareas ni datos de otros usuarios.

### 3) Gestión de tareas
- Crear, editar y eliminar tareas.
- Marcar tareas como completadas.
- Filtrar por estado (pendiente/completada).
- Búsqueda por texto (título/descripción).

### 4) Seguridad y buenas prácticas
- HTTPS obligatorio en despliegue.
- Protección XSS (escaping + Content Security Policy).
- Protección CSRF (tokens en formularios o enfoque equivalente según framework).
- Prevención de SQL Injection (ORM o consultas parametrizadas).
- Rate limiting en login y bloqueo temporal ante intentos fallidos repetidos.

### 5) Notificaciones
- Alertas internas para tareas próximas a vencer (MVP).
- Email notifications como fase posterior.

## Stack recomendado
- **Frontend**: HTML5, CSS3, JavaScript.
- **Backend** (elegir uno):
  - Node.js + Express, o
  - Python + Django, o
  - PHP + Laravel.
- **Base de datos**: MySQL.
- **Autenticación**: sesiones seguras del servidor.

## Comentarios y decisiones sugeridas
1. Para un desarrollo rápido y seguro del MVP, se recomienda **Django** o **Laravel** por controles de seguridad integrados (CSRF, ORM, auth).
2. Si se prioriza flexibilidad en JavaScript full-stack, **Node.js + Express** requiere agregar más piezas manualmente (CSRF, hardening, validaciones).
3. Empezar con autenticación por sesión (sin JWT) simplifica revocación y control de seguridad.

## Preguntas abiertas para iniciar implementación
1. ¿Qué stack quieres confirmar para iniciar: Node/Express, Django o Laravel?
2. ¿Prefieres verificación de email obligatoria desde el MVP o para fase 2?
3. ¿Las notificaciones por correo deben ir en MVP o solo alertas internas inicialmente?
4. ¿Habrá soporte multi-proyecto (varios proyectos por usuario) desde la primera versión?
5. ¿Dónde se desplegará inicialmente (Hosting compartido, VPS, Render, Railway, etc.)?

## Próximos pasos
1. Confirmar stack y alcance del MVP.
2. Diseñar modelo de base de datos (usuarios, roles, tareas, auditoría básica).
3. Implementar autenticación segura + control de roles.
4. Implementar CRUD de tareas con permisos por propietario.
5. Añadir hardening de seguridad y pruebas mínimas.
