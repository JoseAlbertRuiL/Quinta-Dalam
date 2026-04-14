# Plan de Implementación Seguro: Balance y Caja (`balance.astro`)

## Objetivo Central

Gestionar flujos de efectivo, cortes de caja e ingresos de diferentes fuentes (Restaurante, Hotel, Extra) garantizando la **inmutabilidad** y **privacidad absoluta** de los registros financieros.

## 1. Arquitectura de Datos (Supabase SQL)

Para evitar que Astro tenga que descargar cientos de registros y calcular sumas en el servidor (lo cual consume memoria y tiempo de CPU), se propone la creación de una nueva tabla y el uso de **Vistas (Views)** o **RPCs (Remote Procedure Calls)** en PostgreSQL.

### Modelo Propuesto

```sql
CREATE TABLE flujo_caja (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tipo TEXT CHECK (tipo IN ('ingreso', 'egreso')),
  origen TEXT CHECK (origen IN ('recepcion_efectivo', 'banco', 'restaurante', 'room_service')),
  monto NUMERIC(15,2) NOT NULL,
  descripcion TEXT,
  registrado_por TEXT NOT NULL, -- Email del empleado que operó
  creado_en TIMESTAMPTZ DEFAULT NOW()
);
```

### Seguridad de Base de Datos (RLS)

- **Recepcionistas:** Podrán insertar (INSERT) ingresos en `flujo_caja` para cobrar, pero tendrán restringido el (SELECT) total. No deben poder ver el balance global del hotel.
- **Admin/Superadmin:** Tendrán permisos ALL (SELECT, INSERT, UPDATE restringido).

## 2. Lógica del Servidor (Astro SSR)

En `balance.astro`, el bloque servidor (`---`) deberá consumir una función agrupada. No iterar arrays.

```typescript
// Ejemplo ideal en balance.astro:
const { data: balanceData, error } = await supabase.rpc('calcular_balance_mensual', { 
  mes: new Date().getMonth() + 1 
});
```

## 3. UI y Seguridad Frontend

- **Formularios Anti-CSRF:** Cada vez que el administrador intente registrar un Ingreso o Egreso manual, el formulario enviará un estado al endpoint POST interno de Astro.
- **Sin Manipulación en Cliente:** No utilizar JavaScript en el navegador para calcular los porcentajes requeridos en el bosquejo (`[y]%` o `[x]MXN`). Los cálculos de porcentajes se mandan ya procesados desde Astro al HTML, evitando exposición de la lógica de negocio al cliente DOM.
- **Enmascaramiento:** En caso de manejar dinero en pantalla en un equipo a la vista de los clientes, agregar un botón de "Ocultar Valores" que cambie los importes de `$150,000` a `****`.
