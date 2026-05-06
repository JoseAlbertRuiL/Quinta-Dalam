# Plan de Implementación Seguro: Desarrollo (`dev.astro`)

## Objetivo Central

Proveer un canal directo, trazable y seguro entre la administración del Hotel Quinta-Dalam y el equipo de Ingeniería, sin depender exclusivamente de correos externos y manteniendo un registro de auditoría de los reportes.

## 1. Opciones Arquitectónicas Evaluadas

### Opción A: Sistema de Ticketing Interno (Base de Datos)

Crear una tabla `tickets_soporte` dentro de Supabase.

- **Ventajas:** Todo queda en la misma infraestructura. Trazabilidad absoluta. Interfaz 100% nativa.
- **Desventajas:** Requiere diseñar vistas adicionales en el frontend y consume espacio/cuotas de BD para uso esporádico.

### Opción B: Integración Híbrida mediante Webhooks (Recomendada)

Unir el panel de Astro con la plataforma nativa de comunicación de los devs (por ejemplo, **Discord** o **Slack**) manteniendo copias de solo-lectura en log.

#### Flujo Operativo y Seguro

1. El Administrador entra a `dev.astro` y rellena un formulario: `Título`, `Prioridad (Baja/Media/Critica)`, y `Cuerpo del Mensaje`.
2. Se envía la petición por el método seguro `POST` al mismo archivo (SSR) o a `/api/admin-dev`.
3. Astro, validando que el usuario tenga rol de administrador mediante el JWT firmado, ejecuta una llamada de servidor a un **Webhook de Discord**.
4. El mensaje cae inmediatamente en un canal privado de Discord de los programadores con los datos adjuntos y el correo de quien abrió la petición.

## 2. Requerimientos de Seguridad

### Privacidad de Integración

**Bajo ninguna circunstancia** la URL del Webhook debe estar visible en el frontend JavaScript. Todo se envía vía `.env` del servidor.

```env
# En el archivo .env (no trackeado por git)
DISCORD_DEV_WEBHOOK="https://discord.com/api/webhooks/123/abc"
```

### Sanitización contra XSS y Overloads

- El cuerpo de texto del reporte en `dev.astro` debe tener límite de caracteres en el backend (`max length: 2000`) para evitar Payload Overloads en el Webhook.
- Escapar caracteres especiales con utilidades como DOMPurify en el servidor antes de guardarlos/enviarlos si se renderizarán después en HTML, aunque Discord filtra su propio markdown.

## 3. Escalabilidad Futura (Roadmap)

Si el hotel crece junto con el software, `dev.astro` podría escalar y consumir la API de **GitHub Issues** en el entorno local del propietario:
El formulario se conecta mediante el "GitHub Personal Access Token" del Repositorio de Quinta-Dalam (almacenado en `.env`) y genera automáticamente un Issue de tipo `Bug` o `Feature` en la pestaña Github del proyecto directo.
