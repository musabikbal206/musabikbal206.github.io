// linguamis-core.js
(function () {
    const SUPABASE_URL = 'https://mpwmkxbwbkdtbxbbwynw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd21reGJ3YmtkdGJ4YmJ3eW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzI0MzUsImV4cCI6MjEwMzE0ODQzNX0.Ng5pAcxzeJZQKgIqiPpXjJKkdxBlLhHKnSCTRnaOw_8';

    let supabaseInstance = null;

    function getSupabaseClient() {
        if (supabaseInstance) return supabaseInstance;
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return supabaseInstance;
        }
        console.error("Supabase CDN kütüphanesi henüz yüklenmedi!");
        return null;
    }

    window.Linguamis = {
        get supabase() {
            return getSupabaseClient();
        },
        user: null,

        // Oturumu başlatır ve oturum dinleyicisini kurar
        init: async function (onUserChange) {
            const client = getSupabaseClient();
            if (!client) return;

            try {
                const { data: { session } } = await client.auth.getSession();
                this.user = session?.user || null;
                if (typeof onUserChange === 'function') onUserChange(this.user);

                // Kullanıcı durum değişikliklerini canlı dinler
                client.auth.onAuthStateChange((_event, session) => {
                    this.user = session?.user || null;
                    if (typeof onUserChange === 'function') onUserChange(this.user);
                });
            } catch (err) {
                console.error("Linguamis init hatası:", err);
            }
        },

        // Kayıt Ol (Ad Soyad / Nickname ile)
        signUp: async function (email, password, displayName = '') {
            const client = getSupabaseClient();
            if (!client) throw new Error("Veritabanı bağlantısı kurulamadı.");
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName || email.split('@')[0]
                    }
                }
            });
            if (error) throw error;
            return { data, error: null };
        },

        // Giriş Yap
        login: async function (email, password) {
            const client = getSupabaseClient();
            if (!client) throw new Error("Veritabanı bağlantısı kurulamadı.");
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            this.user = data.user;
            return { data, error: null };
        },

        // Çıkış Yap
        logout: async function () {
            const client = getSupabaseClient();
            if (!client) return { error: null };
            const { error } = await client.auth.signOut();
            if (error) throw error;
            this.user = null;
            return { error: null };
        },

        // Şifremi Unuttum (Sıfırlama Bağlantısı Gönder)
        resetPassword: async function (email) {
            const client = getSupabaseClient();
            if (!client) throw new Error("Veritabanı bağlantısı kurulamadı.");
            const { data, error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });
            if (error) throw error;
            return { data, error: null };
        },

        // Ad Soyad / Nickname Güncelleme
        updateProfile: async function (displayName) {
            const client = getSupabaseClient();
            if (!client) throw new Error("Veritabanı bağlantısı kurulamadı.");
            const { data, error } = await client.auth.updateUser({
                data: { display_name: displayName }
            });
            if (error) throw error;
            if (data?.user) this.user = data.user;
            return { data, error: null };
        },

        // Şifre Değiştirme
        changePassword: async function (newPassword) {
            const client = getSupabaseClient();
            if (!client) throw new Error("Veritabanı bağlantısı kurulamadı.");
            const { data, error } = await client.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return { data, error: null };
        },

        // Alt siteler için API key metodları (Gerektiğinde kullanım için korundu)
        saveGeminiKey: async function (apiKey) {
            const client = getSupabaseClient();
            if (!this.user) throw new Error("Önce giriş yapmalısınız.");
            return await client.from('user_api_keys').upsert({
                user_id: this.user.id,
                provider: 'gemini',
                api_key: apiKey
            });
        },

        getGeminiKey: async function () {
            const client = getSupabaseClient();
            if (!this.user) return null;
            const { data, error } = await client
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
