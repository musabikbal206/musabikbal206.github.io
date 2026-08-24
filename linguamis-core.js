// linguamis-core.js

// Supabase Bağlantı Ayarları
const SUPABASE_URL = 'https://mpwmkxbwbkdtbxbbwynw.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd21reGJ3YmtkdGJ4YmJ3eW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzI0MzUsImV4cCI6MjEwMzE0ODQzNX0.Ng5pAcxzeJZQKgIqiPpXjJKkdxBlLhHKnSCTRnaOw_8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.Linguamis = {
    db: supabase,
    user: null,

    init: async function() {
        const { data: { session }, error } = await this.db.auth.getSession();
        if (session) {
            this.user = session.user;
            console.log("Giriş başarılı. Hoş geldin:", this.user.email);
            // Eğer auth arayüzü güncelleyecek fonksiyon varsa çağır (Sadece ana sitede çalışır)
            if (typeof updateAuthUIView === 'function') {
                updateAuthUIView();
            }
        } else {
            console.log("Aktif oturum yok.");
        }
    },
    
    saveGeminiKey: async function(apiKey) {
        if (!this.user) return alert("Lütfen önce giriş yapın!");

        const { error } = await this.db
            .from('user_api_keys')
            .upsert({ 
                user_id: this.user.id, 
                provider: 'gemini', 
                api_key: apiKey 
            });

        if (error) {
            console.error("Anahtar kaydedilemedi:", error.message);
            alert("Bir hata oluştu, tekrar deneyin.");
        } else {
            alert("Gemini API Anahtarınız başarıyla kaydedildi!");
        }
    }
};

// Sayfa yüklendiğinde oturumu otomatik kontrol et
document.addEventListener('DOMContentLoaded', () => {
    window.Linguamis.init();
});
