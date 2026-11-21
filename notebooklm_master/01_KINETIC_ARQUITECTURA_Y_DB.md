# KINETIC OS — Arquitectura Técnica y Modelo de Datos Supabase

## 1. Stack Tecnológico Central
- **Frontend / Mobile**: React Native con Expo Router (soporte cross-platform iOS, Android, Web en kineticapp.com.mx).
- **Backend / BaaS**: Supabase (PostgreSQL 15+, Auth con JWT, Row Level Security estricto, Storage buckets y Edge Functions).
- **Pagos & Monetización**: Stripe México (suscripciones recurrentes y webhooks seguros).
- **Tipado & Estilo**: TypeScript estricto, Tailwind CSS / NativeWind, arquitectura modular (<500 líneas por archivo).

## 2. Esquema Relacional de Base de Datos (Supabase PostgreSQL)
- **`profiles`**:
  - `id` (UUID, PK, references auth.users.id on delete cascade)
  - `username` (TEXT, UNIQUE)
  - `full_name` (TEXT)
  - `avatar_url` (TEXT)
  - `subscription_tier` (TEXT: 'free', 'pro', 'elite')
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **`exercises`**:
  - `id` (UUID, PK, default uuid_generate_v4())
  - `name` (TEXT, NOT NULL)
  - `muscle_group` (TEXT: 'pecho', 'espalda', 'pierna', 'hombro', 'brazo', 'core')
  - `category` (TEXT: 'barra', 'mancuerna', 'maquina', 'peso_corporal')
  - `equipment` (TEXT)
  - `instructions` (TEXT)
- **`workouts`**:
  - `id` (UUID, PK, default uuid_generate_v4())
  - `user_id` (UUID, references profiles.id)
  - `title` (TEXT)
  - `started_at` (TIMESTAMPTZ)
  - `completed_at` (TIMESTAMPTZ)
  - `total_volume_kg` (NUMERIC)
  - `total_sets` (INTEGER)
  - `notes` (TEXT)
- **`workout_sets`**:
  - `id` (UUID, PK, default uuid_generate_v4())
  - `workout_id` (UUID, references workouts.id on delete cascade)
  - `exercise_id` (UUID, references exercises.id)
  - `set_number` (INTEGER)
  - `weight_kg` (NUMERIC)
  - `reps` (INTEGER)
  - `rpe` (NUMERIC: 1-10)
  - `is_warmup` (BOOLEAN default false)
  - `is_completed` (BOOLEAN default true)
- **`personal_records`**:
  - `id` (UUID, PK)
  - `user_id` (UUID, references profiles.id)
  - `exercise_id` (UUID, references exercises.id)
  - `max_weight_kg` (NUMERIC)
  - `estimated_1rm` (NUMERIC)
  - `achieved_at` (TIMESTAMPTZ)

## 3. Algoritmos y Motor de Sobrecarga Progresiva
- **Cálculo de Volumen Total**: Sumatoria de (weight_kg * reps) para series efectivas.
- **Estimación de 1RM**: Fórmula de Epley: 1RM = weight_kg * (1 + reps / 30).
- **Métrica RPE**: Escala Borg modificada (1 a 10) para medir esfuerzo percibido y fatiga del sistema nervioso central.
- **Seguridad RLS**: Políticas de Row Level Security garantizan que cada usuario solo lee y escribe sus propios registros (`auth.uid() = user_id`).
