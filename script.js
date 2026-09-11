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

    const container =
        document.getElementById('videosContainer');

    container.innerHTML =
        '<div class="loading">⏳ वीडियो लोड हो रहे हैं...</div>';

    try {

        const { data, error } =
            await supabaseClient
                .from('videos')
                .select('*')
                .order('created_at', {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            container.innerHTML =
                '<div class="loading">😊 अभी कोई वीडियो नहीं है</div>';

            return;
        }


        container.innerHTML = data.map(video => {

            const title =
                video.title || 'बिना नाम का वीडियो';

            const description =
                video.description || '';

            const link =
                video.flezen_link || '';

            const thumbnail =
                video.thumbnail_url || '';


            return `
                <div class="video-card">

                    ${
                        thumbnail
                            ? `
                            <img
                                src="${thumbnail}"
                                alt="${title}"
                                class="video-thumbnail"
                                onclick="watchVideo('${link}', '${video.id}')"
                                loading="lazy"
                            >
                            `
                            : `
                            <div
                                class="video-thumbnail"
                                style="
                                    background:#2a2a4a;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    color:#666;
                                    font-size:40px;
                                    cursor:pointer;
                                "
                                onclick="watchVideo('${link}', '${video.id}')"
                            >
                                🎬
                            </div>
                            `
                    }


                    <div class="video-info">

                        <h3 class="video-title">
                            ${title}
                        </h3>


                        ${
                            description
                                ? `
                                <p class="video-description">
                                    ${description}
                                </p>
                                `
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
                                    onclick="watchVideo('${link}', '${video.id}', event)"
                                >
                                    ▶ WATCH VIDEO
                                </a>
                                `
                                : `
                                <p>
                                    ❌ वीडियो लिंक उपलब्ध नहीं है
                                </p>
                                `
                        }

                    </div>

                </div>
            `;

        }).join('');


    } catch (error) {

        console.error(
            'Supabase Error:',
            error
        );

        container.innerHTML = `
            <div class="loading">

                ❌ वीडियो लोड नहीं हो पाए।

                <br><br>

                <small>
                    ${error.message}
                </small>

            </div>
        `;
    }
}


// ==========================================
// WATCH VIDEO + CLICK TRACKING
// ==========================================

function watchVideo(link, videoId, event) {

    if (!link) {

        if (event) {
            event.preventDefault();
        }

        alert(
            '❌ वीडियो लिंक उपलब्ध नहीं है।'
        );

        return;
    }


    // ======================================
    // OPEN FLEZEN LINK
    // ======================================

    if (event) {

        // WATCH VIDEO button:
        // <a> का अपना href खुलेगा।
        // यहां popup को रोकना नहीं है.

    } else {

        // Thumbnail पर tap:
        // Flezen link तुरंत खुलेगा.

        window.open(
            link,
            '_blank'
        );
    }


    // ======================================
    // RECORD WATCH CLICK
    // ======================================

    // Link खुलने के बाद click background
    // में Supabase में save होगा.

    supabaseClient
        .from('video_clicks')
        .insert({
            video_id: videoId
        })
        .then(({ error }) => {

            if (error) {

                console.error(
                    'Click tracking error:',
                    error
                );

            }

        })
        .catch(error => {

            console.error(
                'Click tracking error:',
                error
            );

        });
}


// ==========================================
// START
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    loadVideos
);
