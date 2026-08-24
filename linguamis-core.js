// linguamis-core.js
(function () {
    const SUPABASE_URL = 'https://mpwmkxbwbkdtbxbbwynw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wd21reGJ3YmtkdGJ4YmJ3eW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzI0MzUsImV4cCI6MjEwMzE0ODQzNX0.Ng5pAcxzeJZQKgIqiPpXjJKkdxBlLhHKnSCTRnaOw_8';

    function getClient() {
        if (!window.supabase) return null;
        if (!window._supabaseInstance) {
            window._supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return window._supabaseInstance;
    }

    window.Linguamis = {
        db: null,
        user: null,

        init: async function (onUserChange) {
            const db = getClient();
            if (!db) return;
            this.db = db;

            // URL Hash'inde token gelmişse (Ana siteden yönlendirme yapıldıysa) oturumu al
            const hash = window.location.hash;
            if (hash && hash.includes('access_token=')) {
                const params = new URLSearchParams(hash.substring(1));
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');

                if (access_token && refresh_token) {
                    await db.auth.setSession({ access_token, refresh_token });
                    // URL'deki çirkin hash'i temizle
                    window.history.replaceState(null, null, window.location.pathname + window.location.search);
                }
            }

            // Mevcut oturumu çek
            const { data: { session } } = await db.auth.getSession();
            this.user = session?.user || null;

            if (typeof onUserChange === 'function') onUserChange(this.user);

            // Oturum durum değişikliklerini canlı dinle
            db.auth.onAuthStateChange((event, session) => {
                this.user = session?.user || null;
                if (typeof onUserChange === 'function') onUserChange(this.user);
            });
        },

        // Ana siteden alt sitelere geçerken oturum token'ı ile link üretir
        getAppUrlWithAuth: async function (targetUrl) {
            const db = getClient();
            if (!db) return targetUrl;
            const { data: { session } } = await db.auth.getSession();
            if (session) {
                return `${targetUrl}#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
            }
            return targetUrl;
        },

        // Kullanıcının kayıtlı Gemini API anahtarını çeker
        getGeminiKey: async function () {
            const db = getClient();
            if (!this.user || !db) return null;
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
