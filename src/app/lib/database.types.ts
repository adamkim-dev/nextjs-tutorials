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
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          name: string
          date: string
          status: string
          total_money: number
          money_per_user: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          status: string
          total_money?: number
          money_per_user?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          status?: string
          total_money?: number
          money_per_user?: number
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
  }
}