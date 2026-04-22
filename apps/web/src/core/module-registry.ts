/**
 * OMNI MODULE REGISTRY: Pusat Pendaftaran Plugin/Modul Bisnis
 * Setiap kali Bapak/Tim membuat Modul Baru (Folder Baru), Modul itu WAJIB 
 * didaftarkan di sini agar diakui oleh IAM (Matriks) dan Menu Sidebar.
 */

import { LayoutDashboard, Shield, Key, Users, BookOpen, ActivitySquare, GitMerge, ServerCog, Dna, Hammer, Clock, BookMarked, LineChart, Cpu } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface OmniModule {
  id: string;             // Kode Unik Modul (Untuk Database IAM)
  name: string;           // Nama Tampilan Sidebar
  path: string;           // Rute URL (Next.js App Router)
  icon: any;              // Ikon Lucide React
  isCore: boolean;        // Jika True, fitur tidak butuh persetujuan Jaringan.
  category: "hub" | "iam" | "data" | "infra"; // Domain Wilayah Kerja
}

export const ModuleRegistry: OmniModule[] = [
  // --- KATEGORI: HUB (PUSAT PENGGERAK) ---
  { id: "Dashboard", name: "Command Center", path: "/dashboard", icon: LayoutDashboard, isCore: true, category: "hub" },
  { id: "Nexus War Room", name: "Nexus War Room", path: "/war-room", icon: Shield, isCore: true, category: "hub" },
  { id: "Layanan Pengaduan", name: "Public Complaint", path: "/complaints", icon: ActivitySquare, isCore: false, category: "hub" },

  // --- KATEGORI: IAM (BENTENG IDENTITAS) ---
  { id: "IAM Console", name: "IAM Console", path: "/iam", icon: Shield, isCore: true, category: "iam" },
  { id: "Keamanan Mandat", name: "Mandate Delegation", path: "/mandate", icon: Key, isCore: true, category: "iam" },
  { id: "Active Identity Matrix", name: "Active Identity", path: "/access", icon: Users, isCore: true, category: "iam" },
  { id: "Audit Logbook Intel", name: "Audit Logbook", path: "/logbook", icon: BookOpen, isCore: true, category: "iam" },
  { id: "Time-Machine Nexus", name: "Nexus Time-Machine", path: "/recovery", icon: Clock, isCore: true, category: "iam" },

  // --- KATEGORI: DATA (LABORATORIUM DATA) ---
  { id: "PUM Nexus Engine", name: "Nexus Engine (PNE)", path: "/nexus", icon: GitMerge, isCore: false, category: "data" },
  { id: "Omni-Analytics", name: "Analytics Omniverse", path: "/omni-analytics", icon: LineChart, isCore: false, category: "data" },
  { id: "Data Evolution Center", name: "Evolution Center", path: "/evolution", icon: Dna, isCore: false, category: "data" },
  { id: "Omni-Forge (Alat Data)", name: "Omni-Forge", path: "/omni-forge", icon: Hammer, isCore: false, category: "data" },

  // --- KATEGORI: INFRA (RUANG MESIN BAWAH TANAH) ---
  { id: "Aegis Panopticon (DB)", name: "Maintenance Panopticon", path: "/maintenance", icon: ServerCog, isCore: true, category: "infra" },
  { id: "Saraf Interaktif", name: "Event Bus Test", path: "/test-bus", icon: ActivitySquare, isCore: false, category: "infra" },
  { id: "Omni-Codex", name: "Omni-Codex", path: "/codex", icon: BookMarked, isCore: true, category: "infra" },
  { id: "Aegis System Core", name: "System Core (About)", path: "/about", icon: Cpu, isCore: true, category: "infra" },
  { id: "API Exchange", name: "API Gateway Matrix", path: "/api-exchange", icon: ServerCog, isCore: true, category: "infra" },
  { id: "Panduan Developer", name: "DevTeam Blueprint", path: "/dev-manual", icon: BookOpen, isCore: true, category: "infra" }
];

// Helper Function: Mengeluarkan Seluruh ID Modul (Untuk Dirender di Kaca Drawer IAM)
export const getRegisteredModuleIds = () => {
  return ModuleRegistry.map(m => m.id);
};
