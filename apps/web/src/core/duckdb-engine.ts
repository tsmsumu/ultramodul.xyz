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
        this.connection = await db.connect();
        
        console.log("🔥 [DuckDB Wasm] Jantung In-Memory Engine AKTIF!");
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
    } catch (e) {
      console.error(`[DuckDB] Gagal preview ${tableName}:`, e);
      return [];
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
}

export const duckEngine = new DuckDBEngine();
