export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      habitaciones: {
        Row: {
          id: number
          nombre: string
          tipo: string
          precio: number
          disponible: boolean
        }
        Insert: {
          id?: number
          nombre: string
          tipo: string
          precio: number
          disponible?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          tipo?: string
          precio?: number
          disponible?: boolean
        }
        Relationships: []
      }
      reservas: {
        Row: {
          id: number
          nombre_cliente: string
          correo: string
          telefono: string | null
          habitacion: string
          fecha_entrada: string
          fecha_salida: string
          personas: number | null
          created_at: string
        }
        Insert: {
          id?: number
          nombre_cliente: string
          correo: string
          telefono?: string | null
          habitacion: string
          fecha_entrada: string
          fecha_salida: string
          personas?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          nombre_cliente?: string
          correo?: string
          telefono?: string | null
          habitacion?: string
          fecha_entrada?: string
          fecha_salida?: string
          personas?: number | null
          created_at?: string
        }
        Relationships: []
      }
      roles_usuario: {
        Row: {
          id: number
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id?: number
          email: string
          role: string
          created_at?: string
        }
        Update: {
          id?: number
          email?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      [key: string]: any
    }
  }
}
