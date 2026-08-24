// linguamis-core.js
(function () {
    const SUPABASE_URL = 'https://mpwmkxbwbkdtbxbbwynw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd21reGJ3YmtkdGJ4YmJ3eW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzI0MzUsImV4cCI6MjEwMzE0ODQzNX0.Ng5pAcxzeJZQKgIqiPpXjJKkdxBlLhHKnSCTRnaOw_8';

    // Supabase kütüphanesinin hazır olmasını bekleyen yardımcı fonksiyon
    function getSupabaseClient() {
        if (!window.supabase) {
            console.error("Supabase CDN kütüphanesi henüz yüklenmedi!");
            return null;
        }
        if (!window._supabaseInstance) {
            window._supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return window._supabaseInstance;
    }

    window.Linguamis = {
        user: null,

        // Oturumu başlatır ve oturum dinleyicisini kurar
        init: async function (onUserChange) {
            const db = getSupabaseClient();
            if (!db) return;

            const { data: { session } } = await db.auth.getSession();
            this.user = session?.user || null;
            if (typeof onUserChange === 'function') onUserChange(this.user);

            // Kullanıcı durum değişikliklerini canlı dinler
            db.auth.onAuthStateChange((event, session) => {
                this.user = session?.user || null;
                if (typeof onUserChange === 'function') onUserChange(this.user);
            });
        },

        // Kayıt Ol
        signUp: async function (email, password) {
            const db = getSupabaseClient();
            if (!db) throw new Error("Veritabanı bağlantısı yok.");
            return await db.auth.signUp({ email, password });
        },

        // Giriş Yap
        login: async function (email, password) {
            const db = getSupabaseClient();
            if (!db) throw new Error("Veritabanı bağlantısı yok.");
            const { data, error } = await db.auth.signInWithPassword({ email, password });
            if (error) throw error;
            this.user = data.user;
            return data.user;
        },

        // Çıkış Yap
        logout: async function () {
            const db = getSupabaseClient();
            if (!db) return;
            await db.auth.signOut();
            this.user = null;
        },

        // Gemini Key Kaydet
        saveGeminiKey: async function (apiKey) {
            const db = getSupabaseClient();
            if (!this.user) throw new Error("Önce giriş yapmalısınız.");
            return await db.from('user_api_keys').upsert({
                user_id: this.user.id,
                provider: 'gemini',
                api_key: apiKey
            });
        },

        // Gemini Key Getir (34 Alt Sitenin Kullanacağı Metot)
        getGeminiKey: async function () {
            const db = getSupabaseClient();
            if (!this.user) return null;
            const { data, error } = await db
                .from('user_api_keys')
                .select('api_key')
                .eq('user_id', this.user.id)
                .eq('provider', 'gemini')
                .single();

            if (error || !data) return null;
            return data.api_key;
        }
    };
})();
