// ==========================================
// CHUDDNJAAN - ADMIN PANEL
// ==========================================

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    'https://cpsvdtjuxvaqubpnjuzy.supabase.co';

const SUPABASE_KEY =
    'sb_publishable_rgDkg3rHV-Y_ps0iA3muLA_i-h3DfoQ';

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// DOM ELEMENTS
// ==========================================

const loginSection =
    document.getElementById('loginSection');

const signupSection =
    document.getElementById('signupSection');

const dashboardSection =
    document.getElementById('dashboardSection');

const adminEmail =
    document.getElementById('adminEmail');

const videoForm =
    document.getElementById('videoForm');

const adminVideosList =
    document.getElementById('adminVideosList');

const videoFormElement =
    document.getElementById('videoFormElement');

const videoId =
    document.getElementById('videoId');

const videoTitle =
    document.getElementById('videoTitle');

const flezenLink =
    document.getElementById('flezenLink');

const description =
    document.getElementById('description');

const thumbnailFile =
    document.getElementById('thumbnailFile');

const formTitle =
    document.getElementById('formTitle');

const saveVideoBtn =
    document.getElementById('saveVideoBtn');


// ==========================================
// THUMBNAIL UPLOAD
// ==========================================

async function uploadThumbnail(file) {

    if (!file) {
        return null;
    }

    const fileExt =
        file.name.split('.').pop();

    const fileName =
        Date.now() +
        '_' +
        Math.random()
            .toString(36)
            .substring(2, 8) +
        '.' +
        fileExt;


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from('thumbnails')
            .upload(
                fileName,
                file,
                {
                    cacheControl: '3600',
                    upsert: false
                }
            );


    if (uploadError) {

        throw new Error(
            'Thumbnail upload failed: ' +
            uploadError.message
        );

    }


    const {
        data: urlData
    } =
        supabaseClient
            .storage
            .from('thumbnails')
            .getPublicUrl(
                fileName
            );


    return urlData.publicUrl;
}


// ==========================================
// AUTH CHECK
// ==========================================

async function checkAuth() {

    try {

        const {
            data: { session }
        } =
            await supabaseClient.auth.getSession();

        if (session) {

            showDashboard(session.user);

        } else {

            showLogin();

        }

    } catch (error) {

        console.error(
            'Auth error:',
            error
        );

        showLogin();
    }
}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    loginSection.style.display = 'block';

    signupSection.style.display = 'none';

    dashboardSection.style.display = 'none';

    if (adminEmail) {

        adminEmail.textContent = '';

    }
}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard(user) {

    loginSection.style.display = 'none';

    signupSection.style.display = 'none';

    dashboardSection.style.display = 'block';

    if (adminEmail) {

        adminEmail.textContent =
            user.email;

    }

    loadAdminVideos();
}


// ==========================================
// LOGIN
// ==========================================

document
    .getElementById('loginForm')
    .addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            const email =
                document
                    .getElementById('loginEmail')
                    .value
                    .trim();

            const password =
                document
                    .getElementById('loginPassword')
                    .value;

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({
                            email: email,
                            password: password
                        });

                if (error) {

                    throw error;

                }

                showDashboard(
                    data.user
                );

                document
                    .getElementById('loginForm')
                    .reset();

            } catch (error) {

                console.error(
                    'Login error:',
                    error
                );

                alert(
                    '❌ Login failed: ' +
                    error.message
                );
            }

        }
    );


// ==========================================
// DISABLE SIGNUP
// ==========================================

if (signupSection) {

    signupSection.style.display =
        'none';

}

const showSignupLink =
    document.getElementById(
        'showSignup'
    );

if (showSignupLink) {

    showSignupLink.style.display =
        'none';

}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById('logoutBtn')
    .addEventListener(
        'click',
        async () => {

            try {

                await supabaseClient
                    .auth
                    .signOut();

                if (videoForm) {

                    videoForm.style.display =
                        'none';

                }

                showLogin();

            } catch (error) {

                alert(
                    '❌ Logout failed: ' +
                    error.message
                );

            }

        }
    );


// ==========================================
// ADD VIDEO
// ==========================================

document
    .getElementById('addVideoBtn')
    .addEventListener(
        'click',
        () => {

            videoForm.style.display =
                'block';

            formTitle.textContent =
                '📝 नया वीडियो जोड़ें';

            videoId.value = '';

            videoTitle.value = '';

            flezenLink.value = '';

            description.value = '';

            if (thumbnailFile) {
                thumbnailFile.value = '';
            }

            saveVideoBtn.textContent =
                '💾 Save Video';

            videoForm.scrollIntoView({
                behavior: 'smooth'
            });

        }
    );


// ==========================================
// CANCEL FORM
// ==========================================

document
    .getElementById('cancelBtn')
    .addEventListener(
        'click',
        () => {

            videoForm.style.display =
                'none';

            videoFormElement.reset();

            videoId.value = '';

        }
    );


// ==========================================
// SAVE / UPDATE VIDEO
// ==========================================

videoFormElement
    .addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            const id =
                videoId.value.trim();

            const title =
                videoTitle.value.trim();

            const flezen =
                flezenLink.value.trim();

            const desc =
                description.value.trim() ||
                null;


            if (!title) {

                alert(
                    '❌ Video Title डालें।'
                );

                return;
            }


            if (!flezen) {

                alert(
                    '❌ Flezen Video Link डालें।'
                );

                return;
            }


            saveVideoBtn.disabled =
                true;

            saveVideoBtn.textContent =
                '⏳ Saving...';


            try {

                // ==================================
                // UPLOAD NEW THUMBNAIL IF SELECTED
                // ==================================

                let thumbnail_url = null;

                if (
                    thumbnailFile &&
                    thumbnailFile.files &&
                    thumbnailFile.files[0]
                ) {

                    saveVideoBtn.textContent =
                        '⏳ Thumbnail Upload हो रहा है...';

                    thumbnail_url =
                        await uploadThumbnail(
                            thumbnailFile.files[0]
                        );

                }


                if (id) {

                    // =========================
                    // UPDATE
                    // =========================

                    const updateData = {

                        title: title,

                        flezen_link: flezen,

                        description: desc

                    };


                    // अगर नया thumbnail चुना है
                    // तभी thumbnail_url update करें

                    if (thumbnail_url) {

                        updateData.thumbnail_url =
                            thumbnail_url;

                    }


                    const {
                        error
                    } =
                        await supabaseClient
                            .from('videos')
                            .update(
                                updateData
                            )
                            .eq(
                                'id',
                                id
                            );


                    if (error) {

                        throw error;

                    }


                    alert(
                        '✅ वीडियो अपडेट हो गया!'
                    );

                } else {

                    // =========================
                    // INSERT
                    // =========================

                    const {
                        error
                    } =
                        await supabaseClient
                            .from('videos')
                            .insert({

                                title: title,

                                flezen_link: flezen,

                                description: desc,

                                thumbnail_url:
                                    thumbnail_url

                            });


                    if (error) {

                        throw error;

                    }


                    alert(
                        '✅ वीडियो जोड़ दिया गया!'
                    );

                }


                videoForm.style.display =
                    'none';

                videoFormElement.reset();

                videoId.value = '';

                await loadAdminVideos();


            } catch (error) {

                console.error(
                    'Save error:',
                    error
                );

                alert(
                    '❌ Error: ' +
                    error.message
                );


            } finally {

                saveVideoBtn.disabled =
                    false;

                saveVideoBtn.textContent =
                    '💾 Save Video';

            }

        }
    );


// ==========================================
// LOAD ADMIN VIDEOS + ALL WATCH CLICKS
// ==========================================

async function loadAdminVideos() {

    adminVideosList.innerHTML =
        '<div class="loading">⏳ वीडियो लोड हो रहे हैं...</div>';


    try {

        // ==================================
        // LOAD VIDEOS
        // ==================================

        const {
            data,
            error
        } =
            await supabaseClient
                .from('videos')
                .select('*')
                .order(
                    'created_at',
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;

        }


        // ==================================
        // LOAD ALL CLICKS
        // 1000 LIMIT FIX
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
                    .range(
                        from,
                        from + pageSize - 1
                    );


            if (clickError) {

                throw clickError;

            }


            if (
                !clickPage ||
                clickPage.length === 0
            ) {

                break;

            }


            allClickData =
                allClickData.concat(
                    clickPage
                );


            if (
                clickPage.length <
                pageSize
            ) {

                break;

            }


            from += pageSize;

        }


        // ==================================
        // COUNT EACH VIDEO
        // ==================================

        const clickCounts = {};


        allClickData.forEach(
            click => {

                const id =
                    String(
                        click.video_id
                    );

                clickCounts[id] =
                    (
                        clickCounts[id] ||
                        0
                    ) + 1;

            }
        );


        // ==================================
        // TOTAL CLICKS
        // ==================================

        const totalClicks =
            allClickData.length;


        // ==================================
        // NO VIDEOS
        // ==================================

        if (
            !data ||
            data.length === 0
        ) {

            adminVideosList.innerHTML = `

                <div class="loading">

                    😊 अभी कोई वीडियो नहीं है।

                    <br><br>

                    📊 Total WATCH Clicks:
                    ${totalClicks}

                </div>

            `;

            return;

        }


        // ==================================
        // TOTAL CLICK BOX
        // ==================================

        const totalClicksBox = `

            <div
                style="
                    grid-column:1 / -1;
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

            data.map(
                video => {

                    const videoClicks =
                        clickCounts[
                            String(video.id)
                        ] || 0;


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

                                    ${
                                        video.title ||
                                        'Untitled Video'
                                    }

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

                }
            ).join('');



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


// ==========================================
// EDIT VIDEO
// ==========================================

window.editVideo =
    async function (id) {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from('videos')
                    .select('*')
                    .eq(
                        'id',
                        id
                    )
                    .single();


            if (error) {

                throw error;

            }


            videoForm.style.display =
                'block';

            formTitle.textContent =
                '✏️ वीडियो एडिट करें';

            videoId.value =
                data.id;

            videoTitle.value =
                data.title || '';

            flezenLink.value =
                data.flezen_link || '';

            description.value =
                data.description || '';

            if (thumbnailFile) {
                thumbnailFile.value = '';
            }

            saveVideoBtn.textContent =
                '💾 Update Video';


            videoForm.scrollIntoView({
                behavior: 'smooth'
            });


        } catch (error) {

            console.error(
                'Edit error:',
                error
            );

            alert(
                '❌ Error: ' +
                error.message
            );

        }

    };


// ==========================================
// DELETE VIDEO
// ==========================================

window.deleteVideo =
    async function (id) {

        const confirmed =
            confirm(
                'क्या आप इस वीडियो को DELETE करना चाहते हैं?'
            );


        if (!confirmed) {

            return;

        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from('videos')
                    .delete()
                    .eq(
                        'id',
                        id
                    );


            if (error) {

                throw error;

            }


            alert(
                '✅ वीडियो डिलीट हो गया!'
            );


            await loadAdminVideos();


        } catch (error) {

            console.error(
                'Delete error:',
                error
            );


            alert(
                '❌ Error: ' +
                error.message
            );

        }

    };


// ==========================================
// AUTH STATE CHANGE
// ==========================================

supabaseClient.auth
    .onAuthStateChange(
        (event, session) => {

            if (
                event ===
                'SIGNED_IN' &&
                session
            ) {

                showDashboard(
                    session.user
                );


            } else if (
                event ===
                'SIGNED_OUT'
            ) {

                showLogin();

            }

        }
    );


// ==========================================
// START
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        checkAuth();

    }
);
