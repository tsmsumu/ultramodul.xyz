"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { db, timeMachineNotes, eq } from "@ultra/db";
import { revalidatePath } from "next/cache";

const execAsync = promisify(exec);

export async function getTimelineHologram() {
  try {
    // 1. Dapatkan 20 commit terakhir dari Git Local / Server
    const { stdout } = await execAsync('git log -n 25 --pretty=format:"%H|%s|%aI"');
    
    // Format Git Log Output:
    // HASH|Commit Message|ISO Date
    const rawCommits = stdout.split('\n').filter(Boolean).map(line => {
      const [hash, message, date] = line.split('|');
      return { hash, message, date };
    });

    // 2. Dapatkan Catatan Manual dari SQLite
    const hashes = rawCommits.map(c => c.hash);
    const dbNotes = await db.select().from(timeMachineNotes);
    
    // Gabungkan data Git dengan Catatan Admin
    const timeline = rawCommits.map(commit => {
      const noteData = dbNotes.find(n => n.id === commit.hash);
      return {
        ...commit,
        note: noteData?.note || null,
        noteDate: noteData?.createdAt || null,
      };
    });

    return { success: true, payload: timeline };
  } catch (error: any) {
    console.error("Gagal membaca hologram waktu:", error);
    return { success: false, error: "Repository Git tidak terdeteksi atau rusak." };
  }
}

export async function attachMemoryNote(hash: string, noteText: string) {
  try {
    const existing = await db.select().from(timeMachineNotes).where(eq(timeMachineNotes.id, hash)).get();
    if (existing) {
      await db.update(timeMachineNotes).set({ note: noteText }).where(eq(timeMachineNotes.id, hash));
    } else {
      await db.insert(timeMachineNotes).values({
        id: hash,
        note: noteText,
        createdAt: new Date(),
        authorId: "ADMIN" // TODO: Pasang sesi SSO
      });
    }
    revalidatePath("/recovery");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Gagal menempelkan memori pada titik waktu ini." };
  }
}

export async function executeQuantumRollback(hash: string) {
  try {
    // NON-DESTRUCTIVE TIME TRAVEL:
    // 1. Ekstrak kode masa lalu menimpa zona kerja (. target files).
    // Ini mengembalikan seluruh berkas proyek persis seperti kondisi pada <hash>
    // tanpa menaruh kepala git ke masa lalu.
    await execAsync(`git restore --source=${hash} .`);

    // 2. Membungkus kembali perubahan ke masa depan (Committing as new update)
    await execAsync(`git commit -am "chore: Quantum Rollback to Time-Point [${hash.substring(0,7)}]"`);

    // 3. Menembakkan update ke Github agar VPS tersinkron (jika ada origin)
    // Ingat: perintah ini bisa gagal jika tidak ada koneksi SSH di user lokal, 
    // Tapi secara lokal git sudah berputar waktu!
    try {
      await execAsync(`git push origin main`);
    } catch(e) {
      console.warn("Peringatan: Gagal mem-push otomatis ke Remote. Silakan lakukan Git Push manual jika berada di komputer lokal.");
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal melakukan loncatan kuantum:", error);
    return { success: false, error: error.message || "Mesin waktu gagal dieksekusi." };
  }
}
