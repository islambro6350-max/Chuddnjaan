// ==========================================
// LOAD ADMIN VIDEOS + WATCH CLICK COUNTS
// ==========================================

async function loadAdminVideos() {

    adminVideosList.innerHTML =
        '<div class="loading">⏳ वीडियो लोड हो रहे हैं...</div>';

    try {

        // ==================================
        // LOAD VIDEOS
        // ==================================

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


        // ==================================
        // LOAD ALL WATCH CLICKS
        // Supabase 1000-row limit को handle करना
        // ==================================

        let allClickData = [];
        let from = 0;
        const pageSize = 1000;

        while (true) {

            const {
                data: clickPage,
                error: clickError
            } =
                await supabaseClient
                    .from('video_clicks')
                    .select('video_id')
                    .range(from, from + pageSize - 1);

            if (clickError) {
                throw clickError;
            }

            if (!clickPage || clickPage.length === 0) {
                break;
            }

            allClickData =
                allClickData.concat(clickPage);

            // अगर 1000 से कम मिले,
            // तो सारे records मिल चुके हैं
            if (clickPage.length < pageSize) {
                break;
            }

            from += pageSize;
        }


        // ==================================
        // COUNT CLICKS PER VIDEO
        // ==================================

        const clickCounts = {};

        allClickData.forEach(click => {

            const id = String(click.video_id);

            clickCounts[id] =
                (clickCounts[id] || 0) + 1;
        });


        // ==================================
        // TOTAL WATCH CLICKS
        // ==================================

        const totalClicks =
            allClickData.length;


        // ==================================
        // NO VIDEOS
        // ==================================

        if (!data || data.length === 0) {

            adminVideosList.innerHTML = `
                <div class="loading">

                    😊 अभी कोई वीडियो नहीं है।
                    नया वीडियो जोड़ें!

                    <br><br>

                    📊 Total WATCH Clicks:
                    ${totalClicks}

                </div>
            `;

            return;
        }


        // ==================================
        // TOTAL CLICK DISPLAY
        // ==================================

        const totalClicksBox = `
            <div
                style="
                    grid-column: 1 / -1;
                    background:#1a1a2e;
                    border:1px solid #2a2a4a;
                    border-radius:12px;
                    padding:20px;
                    text-align:center;
                    margin-bottom:10px;
                "
            >

                <div
                    style="
                        font-size:28px;
                        font-weight:700;
                        color:#e94560;
                    "
                >
                    📊 ${totalClicks}
                </div>

                <div
                    style="
                        color:#aaa;
                        margin-top:5px;
                        font-size:15px;
                    "
                >
                    Total WATCH Clicks
                </div>

            </div>
        `;


        // ==================================
        // VIDEO LIST
        // ==================================

        adminVideosList.innerHTML =
            totalClicksBox +

            data.map(video => {

                const videoClicks =
                    clickCounts[String(video.id)] || 0;

                return `

                    <div class="video-card">

                        ${
                            video.thumbnail_url
                                ? `
                                <img
                                    src="${video.thumbnail_url}"
                                    alt="${video.title || 'Video'}"
                                    class="video-thumbnail"
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
                                    "
                                >
                                    🎬
                                </div>
                                `
                        }

                        <div class="video-info">

                            <h3 class="video-title">
                                ${video.title || 'Untitled Video'}
                            </h3>

                            ${
                                video.description
                                    ? `
                                    <p class="video-description">
                                        ${video.description}
                                    </p>
                                    `
                                    : ''
                            }

                            <div
                                style="
                                    margin:10px 0;
                                    padding:10px;
                                    background:#2a2a4a;
                                    border-radius:6px;
                                    color:#fff;
                                    font-weight:600;
                                "
                            >

                                👁️ WATCH CLICKS:

                                <span
                                    style="
                                        color:#e94560;
                                        font-size:20px;
                                    "
                                >
                                    ${videoClicks}
                                </span>

                            </div>


                            <div class="admin-actions">

                                <button
                                    onclick="editVideo('${video.id}')"
                                    class="btn btn-warning"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    onclick="deleteVideo('${video.id}')"
                                    class="btn btn-danger"
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join('');


    } catch (error) {

        console.error(
            'Load videos error:',
            error
        );

        adminVideosList.innerHTML = `
            <div class="loading">

                ❌ Videos load नहीं हो पाए।

                <br><br>

                <small>
                    ${error.message}
                </small>

            </div>
        `;
    }
}
