/**
 * OMNI MODULE REGISTRY: Pusat Pendaftaran Plugin/Modul Bisnis
 * Setiap kali Bapak/Tim membuat Modul Baru (Folder Baru), Modul itu WAJIB 
 * didaftarkan di sini agar diakui oleh IAM (Matriks) dan Menu Sidebar.
 */

import { LayoutDashboard, Shield, Key, Users, BookOpen, ActivitySquare, GitMerge, ServerCog, Dna } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface OmniModule {
  id: string;             // Kode Unik Modul (Untuk Database IAM)
  name: string;           // Nama Tampilan Sidebar
  path: string;           // Rute URL (Next.js App Router)
  icon: any;              // Ikon Lucide React
  isCore: boolean;        // Jika True, fitur tidak butuh persetujuan Jaringan.
}

export const ModuleRegistry: OmniModule[] = [
  // --- CORE MODULES (Sistem Induk) ---
  {
    id: "Dashboard",
    name: "Command Center",
    path: "/dashboard",
    icon: LayoutDashboard,
    isCore: true
  },
  {
    id: "IAM Console",
    name: "IAM Console",
    path: "/iam",
    icon: Shield,
    isCore: true
  },
  {
    id: "Keamanan Mandat",
    name: "Mandate Delegation",
    path: "/mandate",
    icon: Key,
    isCore: true
  },
  {
    id: "Active Identity Matrix",
    name: "Active Identity",
    path: "/access",
    icon: Users,
    isCore: true
  },
  {
    id: "Audit Logbook Intel",
    name: "Audit Logbook",
    path: "/logbook",
    icon: BookOpen,
    isCore: true
  },

  // --- BUSINESS MODULES (Plugin yang Akan Datang) ---
  // Modul Dummy untuk Pengujian Event Bus Saraf
  {
    id: "Saraf Interaktif",
    name: "Event Bus Test",
    path: "/test-bus",
    icon: ActivitySquare,
    isCore: false
  },

  // --- BUSINESS MODULES ---
  {
    id: "PUM Nexus Engine",
    name: "Nexus Engine (PNE)",
    path: "/nexus",
    icon: GitMerge,
    isCore: false
  },
  {
    id: "Data Sanitizer Pabrik",
    name: "Data Washing Station",
    path: "/sanitizer",
    icon: ActivitySquare,
    isCore: false
  },
  {
    id: "Layanan Pengaduan",
    name: "Public Complaint",
    path: "/pengaduan",
    icon: ActivitySquare, // Will adapt icon as needed
    isCore: false
  },
  {
    id: "Aegis Panopticon (DB)",
    name: "Maintenance Panopticon",
    path: "/maintenance",
    icon: ServerCog,
    isCore: true // Maintenance mutlak System Core
  },
  {
    id: "Data Evolution Center",
    name: "Evolution Center",
    path: "/evolution",
    icon: Dna,
    isCore: false
  }
];

// Helper Function: Mengeluarkan Seluruh ID Modul (Untuk Dirender di Kaca Drawer IAM)
export const getRegisteredModuleIds = () => {
   return ModuleRegistry.map(m => m.id);
};
