import * as duckdb from '@duckdb/duckdb-wasm';
import * as arrow from 'apache-arrow';

// JSDelivr CDN Bundles to bypass Next.js Webpack Worker complex configurations
const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

class DuckDBEngine {
  private db: duckdb.AsyncDuckDB | null = null;
  private connection: duckdb.AsyncDuckDBConnection | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db && this.connection) return; // Sudah Aktif
    if (this.initPromise) return this.initPromise; // Sedang Proses Aktif

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
        
        // Membangun URL Worker Langsung dari CDN
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
        );

        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        
        URL.revokeObjectURL(worker_url); // Bersihkan Memori

        this.db = db;
        
        // THE OPFS IMMORTALITY INJECTION (Zero-Amnesia)
        // THE OPFS IMMORTALITY INJECTION (Zero-Amnesia)
        try {
          await db.open({ 
            path: 'opfs://pum-nexus.db',
            accessMode: duckdb.DuckDBAccessMode.READ_WRITE
          });
          console.log("🔥 [DuckDB OPFS] Jantung Persistent Engine AKTIF secara KEKAL!");
        } catch (opfsError) {
          console.warn("⚠️ [DuckDB] OPFS tidak didukung atau terblokir. Fallback ke RAM (:memory:) murni.", opfsError);
          await db.open({ 
             path: ':memory:',
             accessMode: duckdb.DuckDBAccessMode.READ_WRITE
          });
        }

        this.connection = await db.connect();
        
        // Memaksa sistem untuk langsung mengukir perubahan ke harddisk (SSD lokal pengguna)
        try {
          await this.connection.query("SET checkpoint_threshold = '0KB';");
          await this.connection.query("SET wal_autocheckpoint = '0KB';");
        } catch (e) {
          // Abaikan jika :memory:
        }
      } catch (error) {
        console.error("🔥 [DuckDB Wasm] Gagal Mengidupkan Engine:", error);
        throw error;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  // Fungsi Inti: Menelan File ArrayBuffer ke RAM (In-Memory Database)
  async ingestFile(tableName: string, fileBuffer: Uint8Array, fileName: string): Promise<boolean> {
    await this.init();
    if (!this.db || !this.connection) return false;

    try {
      // Daftarkan file ke dalam VFS (Virtual File System) Wasm
      await this.db.registerFileBuffer(fileName, fileBuffer);

      // Telan file jadi tabel
      if (fileName.endsWith('.parquet')) {
        await this.connection.query(`CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_parquet('${fileName}');`);
      } else if (fileName.endsWith('.csv')) {
        await this.connection.query(`CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${fileName}');`);
      } else {
         throw new Error("Format tidak didukung. Gunakan Parquet atau CSV.");
      }

      console.log(`✅ [DuckDB] Tabel '${tableName}' berhasil diciptakan di RAM.`);
      return true;
    } catch (e) {
      console.error(`❌ [DuckDB] Gagal menelan file:`, e);
      return false;
    }
  }

  // Fungsi Inti 2: Menelan JSON Object Langsung dari Peladen SQLite
  async ingestJSONData(tableName: string, jsonData: any[]): Promise<boolean> {
    await this.init();
    if (!this.db || !this.connection) return false;

    try {
      const fileName = `${tableName}_${Date.now()}.json`;
      const txt = JSON.stringify(jsonData);
      const buffer = new TextEncoder().encode(txt);

      // Daftarkan memory buffer seolah-olah file di local
      await this.db.registerFileBuffer(fileName, buffer);

      // Telan JSON ke dalam tabel DuckDB
      await this.connection.query(`CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('${fileName}');`);
      
      console.log(`🔥 [DuckDB] SQLite Data disedot dan dipadatkan ke OPFS DuckDB: '${tableName}'.`);
      return true;
    } catch (e) {
      console.error(`❌ [DuckDB] Gagal menelan JSON:`, e);
      return false;
    }
  }

  // Sensor Mata Elang: Rontgen Skema Tabel
  async discoverSchema(tableName: string): Promise<any[]> {
    await this.init();
    if (!this.connection) return [];

    try {
      const result = await this.connection.query(`DESCRIBE ${tableName};`);
      const rows = result.toArray(); // apache arrow rows
      return rows.map(r => r.toJSON()); // Akan mengembalikan list { column_name, column_type, dll }
    } catch (e) {
      console.error(`[DuckDB] Gagal merontgen skema ${tableName}:`, e);
      return [];
    }
  }

  // Visualizer: Tampilkan X baris pertama
  async previewData(tableName: string, limit: number = 10): Promise<any[]> {
    await this.init();
    if (!this.connection) return [];

    try {
      const result = await this.connection.query(`SELECT * FROM ${tableName} LIMIT ${limit};`);
      return result.toArray().map(r => r.toJSON());
    } catch (e: any) {
      console.error(`[DuckDB] Gagal preview ${tableName}:`, e);
      throw new Error(`Data kosong atau Tabel belum disedot! (${e.message})`);
    }
  }

  // Eksekusi SQL Terbuka (Kueri Jahitan/Join)
  async executeRaw(query: string): Promise<any[]> {
    await this.init();
    if (!this.connection) return [];

    try {
      const result = await this.connection.query(query);
      return result.toArray().map(r => r.toJSON());
    } catch (e) {
      console.error(`[DuckDB] Execute Error:`, e);
      throw e;
    }
  }

  // PENDETEKSI MEMORI OPFS: Mengambil nama tabel apa saja yang berhasil bertahan
  async getPersistentTables(): Promise<string[]> {
    await this.init();
    if (!this.connection) return [];
    
    try {
      // Kueri rahasia untuk merontgen isi pikiran OPFS DuckDB
      const result = await this.connection.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='main';`);
      const rows = result.toArray().map(r => r.toJSON());
      return rows.map((r: any) => r.table_name);
    } catch (e) {
      console.error("[DuckDB OPFS] Gagal memanggil ingatan masa lalu:", e);
      return [];
    }
  }

  // Ekstraktor: Ekspor Tabel / View menjadi File Parquet Fisik
  async exportToParquet(tableName: string, fileName: string = 'Ekstrak_Data.parquet'): Promise<Uint8Array | null> {
    await this.init();
    if (!this.db || !this.connection) return null;
    try {
      // Perintah sakti DuckDB untuk mem-pack tabel/view menjadi file Parquet
      await this.connection.query(`COPY (SELECT * FROM ${tableName}) TO '${fileName}' (FORMAT PARQUET);`);
      const buffer = await this.db.copyFileToBuffer(fileName);
      return buffer;
    } catch (e) {
      console.error(`[DuckDB] Gagal mengekstrak Parquet:`, e);
      return null;
    }
  }
}

export const duckEngine = new DuckDBEngine();
