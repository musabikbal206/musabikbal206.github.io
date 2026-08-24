// 1. Supabase Bağlantı Ayarları
const SUPABASE_URL = 'https://mpwmkxbwbkdtbxbbwynw.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd21reGJ3YmtkdGJ4YmJ3eW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzI0MzUsImV4cCI6MjEwMzE0ODQzNX0.Ng5pAcxzeJZQKgIqiPpXjJKkdxBlLhHKnSCTRnaOw_8';

// Supabase istemcisini başlatıyoruz
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Linguamis Hub Objesi (Tüm 34 site bu objeyi kullanacak)
window.Linguamis = {
    db: supabase,
    user: null,

    // A. Oturum Kontrolü (Her site açıldığında ilk bu çalışacak)
    init: async function() {
        const { data: { session }, error } = await this.db.auth.getSession();
        
        if (session) {
            this.user = session.user;
            console.log("Giriş başarılı. Hoş geldin:", this.user.email);
            // Burada kullanıcının premium olup olmadığını da kontrol edebiliriz
        } else {
            console.log("Aktif oturum yok.");
            // Eğer kullanıcı "AI Speaking Coach" gibi giriş zorunlu bir sitedeyse:
            // window.location.href = "https://linguamis.com/login"; // Ana siteye geri yolla
        }
    },

    // B. Kullanıcının Kendi Gemini API Anahtarını Kaydetmesi
    // Bunu sadece ana sitendeki "Profil / Ayarlar" sayfasında kullanacaksın
    saveGeminiKey: async function(apiKey) {
        if (!this.user) return alert("Lütfen önce giriş yapın!");

        // upsert: Kayıt yoksa ekler, varsa günceller
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
    },

    // C. Yapay Zekaya Soru Sorma (İşte Edge Function burada devreye girecek)
    askAI: async function(promptText, appSlug) {
        if (!this.user) return "Giriş yapmalısınız.";
        
        // Bu kısmı bir sonraki adımda Edge Function (Sunucu Fonksiyonu) yazınca dolduracağız!
        // Mantık: İstek Supabase'e gidecek, Supabase kullanıcının API key'ini bulup Google'a soracak.
        console.log("Yapay zekaya istek atılıyor...", promptText);
    }
};

// Sayfa yüklendiğinde oturumu otomatik kontrol et
document.addEventListener('DOMContentLoaded', () => {
    window.Linguamis.init();
});
