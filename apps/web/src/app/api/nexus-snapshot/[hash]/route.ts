import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    if (!hash || hash.length < 5) {
      return new NextResponse("Invalid Hash", { status: 400 });
    }

    // Menggunakan temp directory untuk menaruh archive hasil export Git
    const tempFileName = `snapshot_${hash.substring(0, 7)}_${randomUUID().substring(0,6)}.zip`;
    // Gunakan direktori lokal yang aman agar bisa dihapus. 
    // Menyimpan di root project sementara karena /tmp mungkin beda OS (Windows/Linux)
    const exportPath = path.resolve(process.cwd(), "../../", tempFileName);

    // git archive menciptakan paket zip murni dari commit tertentu (TANPA folder .git dan tanpa node_modules)
    // -o menentukan berkas output.
    await execAsync(`git archive --format=zip ${hash} -o "${exportPath}"`);

    // Baca hasil Zip tersebut untuk dikirimkan melalui HTTP Stream
    const fileBuffer = await fs.readFile(exportPath);

    // Hapus berkas zip fisik dari komputer agar tidak menyampah
    await fs.unlink(exportPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="UltraModul_Recovery_${hash.substring(0, 7)}.zip"`,
      },
    });

  } catch (error: any) {
    console.error("Gagal menstruktur ZIP Kuantum:", error);
    return new NextResponse("Gagal menciptakan bundel arsip. Pastikan hash valid.", { status: 500 });
  }
}
