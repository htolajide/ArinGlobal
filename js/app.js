// ========== ADMIN CONFIGURATION ==========
const ADMIN_PASSWORD = "@Arinola4realme"; // Change this to your secure password

// Supabase Configuration
const SUPABASE_URL = 'https://ufpqifkfkekqjgtiblhv.supabase.co'; // Paste from Step 3
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcHFpZmtma2VrcWpndGlibGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjc2MjUsImV4cCI6MjEwMDc0MzYyNX0.qyoMmjFWqPShhAq-qcDpXsFWHFZIOukpKSh8M4q7nt4';    // Paste from Step 3

// Initialize Supabase client (Renamed to supabaseClient to avoid conflicts)
let supabaseClient;

if (typeof window.supabase === 'undefined') {
  console.error('Supabase failed to load! Check your internet connection or script tags.');
} else {
  console.log('Supabase loaded successfully!');
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ========== PAGE LOADER ==========
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }, 500);
});

// ========== CONTACT FORM HANDLING ==========
async function handleSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');
  
  const formData = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    subject: form.subject.value,
    message: form.message.value.trim(),
    status: 'new'
  };
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Sending...';
  
  try {
    // Save to Supabase
    const { data, error } = await supabaseClient
      .from('enquiries')
      .insert([formData]);
    
    if (error) throw error;
    
    // Also send email via FormSubmit (backup)
    await fetch('https://formsubmit.co/ajax/info@arinolaglobal.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Website Inquiry: ${formData.subject}`,
        message: formData.message
      })
    });
    
    showFormMessage('Thank you! Your enquiry has been submitted successfully.', 'success');
    form.reset();
    
  } catch (error) {
    console.error('Error:', error);
    showFormMessage('Error submitting form. Please try again or call us directly.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Send Message';
  }
}

function showFormMessage(message, type) {
  const formMessage = document.getElementById('formMessage');
  if (!formMessage) return;
  
  formMessage.textContent = message;
  formMessage.style.display = 'block';
  formMessage.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
  formMessage.style.color = type === 'success' ? '#155724' : '#721c24';
  
  setTimeout(() => {
    formMessage.style.display = 'none';
  }, 10000);
}

// ========== ADMIN PANEL FUNCTIONS ==========
function showAdminLogin() {
  const loginModal = document.getElementById('adminLogin');
  if (loginModal) loginModal.classList.add('active');
}

function closeAdminLogin() {
  const loginModal = document.getElementById('adminLogin');
  if (loginModal) loginModal.classList.remove('active');
}

function loginAdmin() {
  const password = document.getElementById('adminPassword').value;
  if (password === ADMIN_PASSWORD) {
    closeAdminLogin();
    document.getElementById('mainWebsite').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');
    loadEnquiries();
  } else {
    alert('Incorrect password!');
  }
}

function logoutAdmin() {
  document.getElementById('adminPanel').classList.remove('active');
  document.getElementById('mainWebsite').style.display = 'block';
  window.scrollTo(0, 0);
}

async function loadEnquiries() {
  const enquiryList = document.getElementById('enquiryList');
  enquiryList.innerHTML = '<p style="text-align: center;">Loading...</p>';
  
  try {
    const { data, error } = await supabaseClient
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      enquiryList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No enquiries yet.</p>';
      return;
    }
    
    enquiryList.innerHTML = '';
    data.forEach(enquiry => {
      const enquiryEl = createEnquiryElement(enquiry.id, enquiry);
      enquiryList.appendChild(enquiryEl);
    });
    
  } catch (error) {
    console.error('Error loading enquiries:', error);
    enquiryList.innerHTML = '<p style="text-align: center; color: red;">Error loading enquiries.</p>';
  }
}

function createEnquiryElement(id, data) {
  const div = document.createElement('div');
  div.className = 'enquiry-item';
  
  const date = new Date(data.created_at).toLocaleString();
  
  div.innerHTML = `
    <div class="enquiry-header" onclick="toggleEnquiryDetail('${id}')">
      <div>
        <strong>${data.name}</strong> - ${data.subject}
        <div class="enquiry-date">${date}</div>
      </div>
      <span class="enquiry-status status-${data.status || 'new'}">${(data.status || 'new').toUpperCase()}</span>
    </div>
    <div class="enquiry-detail" id="detail-${id}">
      <div class="detail-row">
        <div class="detail-label">Email:</div>
        <div>${data.email}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Phone:</div>
        <div>${data.phone}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Message:</div>
        <div>${data.message}</div>
      </div>
      <div style="margin-top: 15px;">
        <button onclick="markAsRead('${id}')" class="btn" style="padding: 8px 20px; margin-right: 10px;">Mark as Read</button>
        <a href="mailto:${data.email}?subject=Re: ${data.subject}" class="btn" style="padding: 8px 20px; background: var(--primary-color);">Reply via Email</a>
      </div>
    </div>
  `;
  
  return div;
}

function toggleEnquiryDetail(id) {
  const detail = document.getElementById(`detail-${id}`);
  if (detail) detail.classList.toggle('active');
}

async function markAsRead(id) {
  try {
    const { error } = await supabaseClient
      .from('enquiries')
      .update({ status: 'read' })
      .eq('id', id);
    
    if (error) throw error;
    
    loadEnquiries();
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Error updating status');
  }
}

// Update year
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}