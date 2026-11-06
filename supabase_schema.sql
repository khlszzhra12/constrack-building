-- ===================================================================
-- CONSTRACK – Construction Project Monitoring & Management System
-- supabase_schema.sql
-- Database Schema & Row Level Security (RLS) untuk Supabase PostgreSQL
-- ===================================================================

-- 1. TABEL PROFIL PENGGUNA (PROFILES)
-- Terhubung langsung dengan tabel auth.users bawaan Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nim TEXT,
  university TEXT DEFAULT 'Teknik Sipil',
  role TEXT DEFAULT 'Mahasiswa / Project Manager',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL PROYEK (PROJECTS)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  jenis TEXT NOT NULL, -- Gedung, Jalan, Jembatan, Drainase, Irigasi, dll.
  kontraktor TEXT,
  konsultan TEXT,
  owner TEXT,
  nomor_kontrak TEXT,
  nilai_kontrak NUMERIC DEFAULT 0,
  nilai_rab NUMERIC DEFAULT 0,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai_rencana DATE NOT NULL,
  tanggal_selesai_aktual DATE,
  durasi_rencana_hari INTEGER DEFAULT 180,
  durasi_minggu INTEGER DEFAULT 26,
  minggu_berjalan INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Sedang Berlangsung',
  deskripsi TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL ANGGOTA KELOMPOK KERJA PROYEK (PROJECT_MEMBERS)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_name TEXT NOT NULL,
  member_nim TEXT,
  role TEXT DEFAULT 'Anggota Tim' CHECK (role IN ('Ketua Proyek', 'Estimator Biaya', 'Pengawas Lapangan', 'Anggota Tim')),
  access_level TEXT DEFAULT 'editor' CHECK (access_level IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL RENCANA ANGGARAN BIAYA (RAB_ITEMS)
CREATE TABLE IF NOT EXISTS public.rab_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  divisi TEXT NOT NULL,
  kode_pekerjaan TEXT NOT NULL,
  uraian TEXT NOT NULL,
  volume NUMERIC NOT NULL DEFAULT 0,
  satuan TEXT NOT NULL,
  harga_satuan NUMERIC NOT NULL DEFAULT 0,
  jumlah_harga NUMERIC NOT NULL DEFAULT 0,
  tgl_mulai_rencana DATE,
  tgl_selesai_rencana DATE,
  tgl_mulai_aktual DATE,
  tgl_selesai_aktual DATE,
  progres_rencana NUMERIC DEFAULT 0,
  progres_aktual NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Belum Dimulai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL PENGELUARAN AKTUAL (EXPENSES)
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  no_bukti TEXT NOT NULL,
  kategori TEXT NOT NULL,
  uraian TEXT NOT NULL,
  nominal NUMERIC NOT NULL DEFAULT 0,
  vendor TEXT,
  metode_bayar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL ARUS KAS (CASH_FLOWS)
CREATE TABLE IF NOT EXISTS public.cash_flows (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  bulan TEXT NOT NULL,
  pemasukan_rencana NUMERIC DEFAULT 0,
  pemasukan_aktual NUMERIC DEFAULT 0,
  uraian_pemasukan TEXT,
  pengeluaran_rencana NUMERIC DEFAULT 0,
  pengeluaran_aktual NUMERIC DEFAULT 0,
  rincian_pengeluaran TEXT,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS) POLICIES
-- Memastikan mahasiswa HANYA dapat melihat & mengubah data proyek miliknya
-- atau proyek yang telah dibagikan kepadanya dalam kelompok.
-- ===================================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rab_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;

-- Policy untuk Profiles
CREATE POLICY "Pengguna dapat melihat profil miliknya" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat mengupdate profil miliknya" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat menambah profil saat registrasi" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Helper Function: Cek apakah user adalah owner atau anggota proyek
CREATE OR REPLACE FUNCTION public.has_project_access(p_id TEXT, req_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects WHERE id = p_id AND owner_id = req_uid
  ) OR EXISTS (
    SELECT 1 FROM public.project_members WHERE project_id = p_id AND (user_id = req_uid OR member_email = (SELECT email FROM auth.users WHERE id = req_uid))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy untuk Projects
CREATE POLICY "Pengguna melihat proyek miliknya atau timnya" 
  ON public.projects FOR SELECT 
  USING (owner_id = auth.uid() OR public.has_project_access(id, auth.uid()));

CREATE POLICY "Pengguna dapat membuat proyek baru" 
  ON public.projects FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Pemilik atau anggota editor dapat mengubah proyek" 
  ON public.projects FOR UPDATE 
  USING (owner_id = auth.uid() OR public.has_project_access(id, auth.uid()));

CREATE POLICY "Hanya pemilik proyek yang dapat menghapus proyek" 
  ON public.projects FOR DELETE 
  USING (owner_id = auth.uid());

-- Policy untuk Project Members
CREATE POLICY "Akses anggota kelompok proyek" 
  ON public.project_members FOR ALL 
  USING (public.has_project_access(project_id, auth.uid()));

-- Policy untuk RAB Items
CREATE POLICY "Akses item RAB sesuai proyek" 
  ON public.rab_items FOR ALL 
  USING (public.has_project_access(project_id, auth.uid()));

-- Policy untuk Expenses
CREATE POLICY "Akses pengeluaran sesuai proyek" 
  ON public.expenses FOR ALL 
  USING (public.has_project_access(project_id, auth.uid()));

-- Policy untuk Cash Flows
CREATE POLICY "Akses arus kas sesuai proyek" 
  ON public.cash_flows FOR ALL 
  USING (public.has_project_access(project_id, auth.uid()));

-- Trigger untuk membuat profil otomatis saat user signup di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, nim, university, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mahasiswa Teknik Sipil'),
    COALESCE(NEW.raw_user_meta_data->>'nim', '-'),
    COALESCE(NEW.raw_user_meta_data->>'university', 'Teknik Sipil'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Mahasiswa / Estimator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
