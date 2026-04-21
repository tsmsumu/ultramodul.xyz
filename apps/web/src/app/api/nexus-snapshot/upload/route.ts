import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("File ZIP tidak ditemukan", { status: 400 });
    }

    // Baca file stream ke buffer lokal di Root Workspace
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Letakkan sementara zip tersebut di root aplikasi
    const tempFileName = `restore_${randomUUID().substring(0,6)}.zip`;
    const uploadPath = path.resolve(process.cwd(), "../../", tempFileName); // Keluar dari web app ke root
    const workspacePath = path.resolve(process.cwd(), "../../");

    await fs.writeFile(uploadPath, buffer);

    try {
      // NON-DESTRUCTIVE TIME TRAVEL (EXTERNAL ZIP EDITION)
      // Gunakan tar karena tar ada secara default di Windows 10+ dan Linux.
      // -x extract, -f file, -m perbarui waktu modifikasi, -C spesifikasi destinasi direktori
      await execAsync(`tar -xf "${uploadPath}" -m -C "${workspacePath}"`);
    } catch(extractError) {
      console.error("Native tar extract failed, falling back to powershell Expand-Archive on Windows or unzip on Linux...");
      try {
        // Fallback Khusus VPS / Ubuntu (Linux)
        await execAsync(`unzip -o "${uploadPath}" -d "${workspacePath}"`);
      } catch (linuxError) {
        // Fallback Khusus Windows Server 
        await execAsync(`powershell -command "Expand-Archive -Force '${uploadPath}' '${workspacePath}'"`);
      }
    }

    // Ekstraksi berhasil, hapus file zip mentah
    await fs.unlink(uploadPath);

    // Otomatisasi Git Commit menandakan Pemulihan Manual dari Eksternal
    await execAsync(`git add .`);
    await execAsync(`git commit -m "chore: Manual External ZIP Recovery Snapshot [${file.name}]"`, { cwd: workspacePath });
    
    try {
      await execAsync(`git push origin main`, { cwd: workspacePath });
    } catch(e) {
      console.warn("Gagal git push otomatis. Bisa jadi sedang tidak memilik akses SSH. (Diabaikan)");
    }

    return new NextResponse(JSON.stringify({ success: true, message: "Restorasi Kuantum Eksternal Selesai!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Gagal melakukan External Quantum Restore:", error);
    return new NextResponse("Pemulihan Gagal secara Internal Server Error", { status: 500 });
  }
}
