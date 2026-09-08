
// ==========================================
// CHUDDNJAAN - VIDEO LOADER
// ==========================================

const SUPABASE_URL = 'https://cpsvdtjuxvaqubpnjuzy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rgDkg3rHV-Y_ps0iA3muLA_i-h3DfoQ';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ==========================================
// LOAD VIDEOS
// ==========================================

async function loadVideos() {

    const container = document.getElementById('videosContainer');

    container.innerHTML =
        '<div class="loading">⏳ वीडियो लोड हो रहे हैं...</div>';

    try {

        const { data, error } = await supabaseClient
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            container.innerHTML =
                '<div class="loading">😊 अभी कोई वीडियो नहीं है</div>';

            return;
        }

        container.innerHTML = data.map(video => {

            const title = video.title || 'बिना नाम का वीडियो';
            const description = video.description || '';
            const link = video.flezen_link || '';

            return `
                <div class="video-card">

                    <div
                        class="video-thumbnail"
                        style="
                            background: #2a2a4a;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #666;
                            font-size: 40px;
                            cursor: pointer;
                        "
                        onclick="watchVideo('${link}')"
                    >
                        🎬
                    </div>

                    <div class="video-info">

                        <h3 class="video-title">
                            ${title}
                        </h3>

                        ${
                            description
                                ? `<p class="video-description">${description}</p>`
                                : ''
                        }

                        ${
                            link
                                ? `
                                <a
                                    href="${link}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="watch-btn"
                                >
                                    ▶ WATCH VIDEO
                                </a>
                                `
                                : `
                                <p>❌ वीडियो लिंक उपलब्ध नहीं है</p>
                                `
                        }

                    </div>

                </div>
            `;

        }).join('');

    } catch (error) {

        console.error('Supabase Error:', error);

        container.innerHTML = `
            <div class="loading">
                ❌ वीडियो लोड नहीं हो पाए।
                <br><br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// ==========================================
// WATCH VIDEO
// ==========================================

function watchVideo(link) {

    if (!link) {
        alert('❌ वीडियो लिंक उपलब्ध नहीं है।');
        return;
    }

    window.open(link, '_blank');
}

// ==========================================
// START
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    loadVideos
);
