// ⚠️ IMPORTANT: अपनी Supabase keys यहाँ डालें!
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
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

// Check Login
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        showDashboard(session.user);
    } else {
        showLogin();
    }
}

function showLogin() {
    loginSection.style.display = 'block';
    signupSection.style.display = 'none';
    dashboardSection.style.display = 'none';
}

function showSignup() {
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

function showDashboard(user) {
    loginSection.style.display = 'none';
    signupSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    adminEmail.textContent = user.email;
    loadAdminVideos();
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        showDashboard(data.user);
        document.getElementById('loginForm').reset();
    } catch (error) {
        alert('❌ Login failed: ' + error.message);
    }
});

// Signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        alert('✅ Account created! कृपया Login करें।');
        showLogin();
        document.getElementById('signupForm').reset();
    } catch (error) {
        alert('❌ Signup failed: ' + error.message);
    }
});

document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    showSignup();
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showLogin();
});

// Show Add Video Form
document.getElementById('addVideoBtn').addEventListener('click', () => {
    videoForm.style.display = 'block';
    formTitle.textContent = '📝 नया वीडियो जोड़ें';
    videoId.value = '';
    videoTitle.value = '';
    flezenLink.value = '';
    thumbnailUrl.value = '';
    description.value = '';
    saveVideoBtn.textContent = '💾 Save Video';
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    videoForm.style.display = 'none';
});

// Save Video
videoFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = videoId.value;
    const title = videoTitle.value;
    const flezen = flezenLink.value;
    const thumbnail = thumbnailUrl.value || null;
    const desc = description.value || null;
    
    try {
        if (id) {
            const { error } = await supabaseClient
                .from('videos')
                .update({
                    title,
                    flezen_link: flezen,
                    thumbnail_url: thumbnail,
                    description: desc
                })
                .eq('id', id);
            
            if (error) throw error;
            alert('✅ वीडियो अपडेट हो गया!');
        } else {
            const { error } = await supabaseClient
                .from('videos')
                .insert({
                    title,
                    flezen_link: flezen,
                    thumbnail_url: thumbnail,
                    description: desc
                });
            
            if (error) throw error;
            alert('✅ वीडियो जोड़ दिया गया!');
        }
        
        videoForm.style.display = 'none';
        loadAdminVideos();
        videoFormElement.reset();
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
});

// Load Admin Videos
async function loadAdminVideos() {
    adminVideosList.innerHTML = '<div class="loading">⏳ लोड हो रहा है...</div>';
    
    try {
        const { data, error } = await supabaseClient
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            adminVideosList.innerHTML = '<div class="loading">😊 अभी कोई वीडियो नहीं है। नया जोड़ें!</div>';
            return;
        }
        
        adminVideosList.innerHTML = data.map(video => `
            <div class="video-card">
                ${video.thumbnail_url ? 
                    `<img src="${video.thumbnail_url}" alt="${video.title}" class="video-thumbnail">` :
                    `<div class="video-thumbnail" style="background: #2a2a4a; display: flex; align-items: center; justify-content: center; color: #666; font-size: 40px;">
                        🎬
                    </div>`
                }
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                    <div class="admin-actions">
                        <button onclick="editVideo('${video.id}')" class="btn btn-warning">✏️ Edit</button>
                        <button onclick="deleteVideo('${video.id}')" class="btn btn-danger">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error:', error);
        adminVideosList.innerHTML = '<div class="loading">❌ Error loading videos</div>';
    }
}

// Edit Video
window.editVideo = async (id) => {
    try {
        const { data, error } = await supabaseClient
            .from('videos')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        videoForm.style.display = 'block';
        formTitle.textContent = '✏️ वीडियो एडिट करें';
        videoId.value = data.id;
        videoTitle.value = data.title;
        flezenLink.value = data.flezen_link;
        thumbnailUrl.value = data.thumbnail_url || '';
        description.value = data.description || '';
        saveVideoBtn.textContent = '💾 Update Video';
        
        videoForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
};

// Delete Video
window.deleteVideo = async (id) => {
    if (!confirm('क्या आप इस वीडियो को DELETE करना चाहते हैं?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('videos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        alert('✅ वीडियो डिलीट हो गया!');
        loadAdminVideos();
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
};

document.addEventListener('DOMContentLoaded', checkAuth);
