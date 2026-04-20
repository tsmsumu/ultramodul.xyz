/**
 * OMNI EVENT BUS: Saraf Penghubung Nirkabel Antar Modul
 * Menggunakan pendekatan Pub/Sub murni yang cepat.
 */

type EventCallback = (payload: any) => void;

class OmniEventBus {
  private listeners: Record<string, EventCallback[]> = {};

  // Modul berlangganan (Mendengarkan Sinyal)
  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Mengembalikan fungsi untuk berhenti mendengarkan
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  // Modul menembakkan sinyal secara gaib ke udara
  publish(event: string, payload?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(payload));
  }
}

// Mengekspor Singleton (Satu jaringan otak yang sama untuk seluruh Aplikasi)
export const EventBus = new OmniEventBus();

// Kamus Sinyal (Daftar Sandi Sinyal Radio agar tidak ada kesalahan ketik)
export const EVENTS = {
  NOTIFICATION_ALERT: 'NOTIFICATION_ALERT',
  USER_BANNED_LIVE: 'USER_BANNED_LIVE',
  MATRIX_CHANGED_LIVE: 'MATRIX_CHANGED_LIVE',
  SYSTEM_EMERGENCY_JIT: 'SYSTEM_EMERGENCY_JIT'
};
