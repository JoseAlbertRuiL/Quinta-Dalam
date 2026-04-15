/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Email del usuario autenticado. Solo se asigna en rutas /admin/* protegidas. */
    email?: string;
    /** Rol RBAC del usuario. Solo se asigna tras validación exitosa en middleware. */
    role?: 'superadmin' | 'admin' | 'recepcion';
  }
}
