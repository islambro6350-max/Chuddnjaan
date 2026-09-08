// ==========================================
// CHUDDNJAAN - ADMIN PANEL
// ==========================================

// Supabase Configuration
const SUPABASE_URL = 'https://cpsvdtjuxvaqubpnjuzy.supabase.co';
const SUPABASE_KEY = 'Waseemsb_publishable_rgDkg3rHV-Y_ps0iA3muLA_i-h3DfoQ';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// DOM ELEMENTS
// ==========================================

const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const dashboardSection = document.getElementById('dashboardSection');

const adminEmail = document.getElementById('adminEmail');
const videoForm = document.getElementById('videoForm');
const adminVideosList = document.getElementById('adminVideosList');
const videoFormElement = document.getElementById('videoFormElement');

const videoId = document.getElementById('videoId');
const videoTitle = document.getElementById('videoTitle');
const flezenLink = document.getElementById('flezenLink');
const thumbnailUrl = document.getElementById('thumbnailUrl');
const description = document.getElementById('description');

const formTitle = document.getElementById('formTitle');
const saveVideoBtn = document.getElementById('saveVideoBtn');


// ==========================================
// AUTH CHECK
// ==========================================

async function checkAuth() {
    try {
        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (session) {
            showDashboard(session.user);
        } else {
            showLogin();
        }

    } catch (error) {
        console.error('Auth error:', error);
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

    adminEmail.textContent = user.email;

    loadAdminVideos();
}


// ==========================================
// LOGIN
// ==========================================

document.getElementById('loginForm').addEventListener('submit', async (e) => {

    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        showDashboard(data.user);

        document.getElementById('loginForm').reset();

    } catch (error) {

        console.error(error);

        alert('❌ Login failed: ' + error.message);
    }
});


// ==========================================
// DISABLE PUBLIC SIGNUP
// ==========================================

// आपकी वेबसाइट में नया Admin account बनाने का option नहीं होगा।
if (signupSection) {
    signupSection.style.display = 'none';
}

const showSignupLink = document.getElementById('showSignup');

if (showSignupLink) {
    showSignupLink.style.display = 'none';
}


// ==========================================
// LOGOUT
// ==========================================

document.getElementById('logoutBtn').addEventListener('click', async () => {

    try {

        await supabaseClient.auth.signOut();

        videoForm.style.display = 'none';

        showLogin();

    } catch (error) {

        alert('❌ Logout failed: ' + error.message);
    }
});


// ==========================================
// ADD VIDEO FORM
// ==========================================

document.getElementById('addVideoBtn').addEventListener('click', () => {

    videoForm.style.display = 'block';

    formTitle.textContent = '📝 नया वीडियो जोड़ें';

    videoId.value = '';
    videoTitle.value = '';
    flezenLink.value = '';
    thumbnailUrl.value = '';
    description.value = '';

    saveVideoBtn.textContent = '💾 Save Video';

    videoForm.scrollIntoView({
        behavior: 'smooth'
    });
});


// ==========================================
// CANCEL FORM
// ==========================================

document.getElementById('cancelBtn').addEventListener('click', () => {

    videoForm.style.display = 'none';

    videoFormElement.reset();

    videoId.value = '';
});


// ==========================================
// SAVE / UPDATE VIDEO
// ==========================================

videoFormElement.addEventListener('submit', async (e) => {

    e.preventDefault();

    const id = videoId.value.trim();
    const title = videoTitle.value.trim();
    const flezen = flezenLink.value.trim();
    const thumbnail = thumbnailUrl.value.trim() || null;
    const desc = description.value.trim() || null;

    if (!title) {
        alert('❌ Video Title डालें।');
        return;
    }

    if (!flezen) {
        alert('❌ Flezen Video Link डालें।');
        return;
    }

    saveVideoBtn.disabled = true;
    saveVideoBtn.textContent = '⏳ Saving...';

    try {

        if (id) {

            // UPDATE
            const { error } = await supabaseClient
                .from('videos')
                .update({
                    title: title,
                    flezen_link: flezen,
                    thumbnail_url: thumbnail,
                    description: desc
                })
                .eq('id', id);

            if (error) {
                throw error;
            }

            alert('✅ वीडियो अपडेट हो गया!');

        } else {

            // INSERT
            const { error } = await supabaseClient
                .from('videos')
                .insert({
                    title: title,
                    flezen_link: flezen,
                    thumbnail_url: thumbnail,
                    description: desc
                });

            if (error) {
                throw error;
            }

            alert('✅ वीडियो जोड़ दिया गया!');
        }

        videoForm.style.display = 'none';

        videoFormElement.reset();

        videoId.value = '';

        await loadAdminVideos();

    } catch (error) {

        console.error('Save error:', error);

        alert('❌ Error: ' + error.message);

    } finally {

        saveVideoBtn.disabled = false;

        saveVideoBtn.textContent = '💾 Save Video';
    }
});


// ==========================================
// LOAD ADMIN VIDEOS
// ==========================================

async function loadAdminVideos() {

    adminVideosList.innerHTML =
        '<div class="loading">⏳ वीडियो लोड हो रहे हैं...</div>';

    try {

        const { data, error } = await supabaseClient
            .from('videos')
            .select('*')
            .order('created_at', {
                ascending: false
            });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            adminVideosList.innerHTML =
                '<div class="loading">😊 अभी कोई वीडियो नहीं है। नया वीडियो जोड़ें!</div>';

            return;
        }

        adminVideosList.innerHTML = data.map(video => `

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

        `).join('');

    } catch (error) {

        console.error('Load videos error:', error);

        adminVideosList.innerHTML =
            '<div class="loading">❌ Videos load नहीं हो पाए।</div>';
    }
}


// ==========================================
// EDIT VIDEO
// ==========================================

window.editVideo = async function (id) {

    try {

        const { data, error } = await supabaseClient
            .from('videos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        videoForm.style.display = 'block';

        formTitle.textContent = '✏️ वीडियो एडिट करें';

        videoId.value = data.id;
        videoTitle.value = data.title || '';
        flezenLink.value = data.flezen_link || '';
        thumbnailUrl.value = data.thumbnail_url || '';
        description.value = data.description || '';

        saveVideoBtn.textContent = '💾 Update Video';

        videoForm.scrollIntoView({
            behavior: 'smooth'
        });

    } catch (error) {

        console.error('Edit error:', error);

        alert('❌ Error: ' + error.message);
    }
};


// ==========================================
// DELETE VIDEO
// ==========================================

window.deleteVideo = async function (id) {

    const confirmed = confirm(
        'क्या आप इस वीडियो को DELETE करना चाहते हैं?'
    );

    if (!confirmed) {
        return;
    }

    try {

        const { error } = await supabaseClient
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        alert('✅ वीडियो डिलीट हो गया!');

        await loadAdminVideos();

    } catch (error) {

        console.error('Delete error:', error);

        alert('❌ Error: ' + error.message);
    }
};


// ==========================================
// AUTH STATE CHANGE
// ==========================================

supabaseClient.auth.onAuthStateChange((event, session) => {

    if (event === 'SIGNED_IN' && session) {

        showDashboard(session.user);

    } else if (event === 'SIGNED_OUT') {

        showLogin();
    }
});


// ==========================================
// START
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
