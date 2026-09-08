// Supabase Configuration
const SUPABASE_URL = 'https://cpsvdtjuxvaqubpnjuzy.supabase.co';
const SUPABASE_KEY = 'Waseemsb_publishable_rgDkg3rHV-Y_ps0iA3muLA_i-h3DfoQ';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function loadVideos() {
    const container = document.getElementById('videosContainer');

    container.innerHTML =
        '<div class="loading">⏳ वीडियो लोड हो रहे हैं...</div>';

    try {
        const { data, error } = await supabaseClient
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML =
                '<div class="loading">😊 अभी कोई वीडियो नहीं है</div>';
            return;
        }

        container.innerHTML = data.map(video => `
            <div class="video-card">

                ${
                    video.thumbnail_url
                        ? `
                        <img
                            src="${video.thumbnail_url}"
                            alt="${video.title}"
                            class="video-thumbnail"
                            onclick="watchVideo('${video.flezen_link}')"
                        >
                        `
                        : `
                        <div
                            class="video-thumbnail"
                            style="
                                background: #2a2a4a;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: #666;
                                font-size: 40px;
                            "
                        >
                            🎬
                        </div>
                        `
                }

                <div class="video-info">
                    <h3 class="video-title">
                        ${video.title}
                    </h3>

                    ${
                        video.description
                            ? `<p class="video-description">${video.description}</p>`
                            : ''
                    }

                    <a
                        href="${video.flezen_link}"
                        target="_blank"
                        class="watch-btn"
                    >
                        ▶ WATCH VIDEO
                    </a>
                </div>

            </div>
        `).join('');

    } catch (error) {
        console.error('Error:', error);

        container.innerHTML =
            '<div class="loading">❌ वीडियो लोड नहीं हो पाए। कृपया बाद में try करें।</div>';
    }
}

function watchVideo(link) {
    window.open(link, '_blank');
}

document.addEventListener('DOMContentLoaded', loadVideos);
