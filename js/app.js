// ========== ADMIN CONFIGURATION ==========
const ADMIN_PASSWORD = "@Arinola4realme"; // Change this to your secure password

// Supabase Configuration
const SUPABASE_URL = 'https://ufpqifkfkekqjgtiblhv.supabase.co'; // Paste from Step 3
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcHFpZmtma2VrcWpndGlibGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjc2MjUsImV4cCI6MjEwMDc0MzYyNX0.qyoMmjFWqPShhAq-qcDpXsFWHFZIOukpKSh8M4q7nt4';    // Paste from Step 3

let supabaseClient;
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;

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
  
  const firstNameVal = document.getElementById('firstName').value.trim();
  const lastNameVal = document.getElementById('lastName').value.trim();
  const emailVal = document.getElementById('email').value.trim();
  const phoneVal = document.getElementById('phone').value.trim();
  const subjectVal = document.getElementById('subject').value;
  const messageVal = document.getElementById('message').value.trim();

  if (!firstNameVal || !lastNameVal || !emailVal || !phoneVal || !subjectVal || !messageVal) {
    showFormMessage('Please fill in all required fields.', 'error');
    return;
  }

  const formData = {
    name: `${firstNameVal} ${lastNameVal}`,
    email: emailVal,
    phone: phoneVal,
    subject: subjectVal,
    message: messageVal,
    status: 'new'
  };
  
  const submitBtn = document.getElementById('submitBtn');
  const originalBtnText = submitBtn.innerHTML;
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
  
  try {
    const { data, error } = await supabaseClient.from('enquiries').insert([formData]);
    if (error) throw error;
    
    await fetch('https://formsubmit.co/ajax/info@arinolaglobal.com.ng', {
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
    document.getElementById('contactForm').reset();
    
  } catch (error) {
    console.error('Error:', error);
    showFormMessage('Error submitting form. Please try again or call us directly.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

function showFormMessage(message, type) {
  const formMessage = document.getElementById('formMessage');
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.style.display = 'block';
  formMessage.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
  formMessage.style.color = type === 'success' ? '#155724' : '#721c24';
  setTimeout(() => { formMessage.style.display = 'none'; }, 10000);
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
    currentPage = 1; // Reset to page 1 on login
    loadEnquiries(currentPage);
  } else {
    alert('Incorrect password!');
  }
}

function logoutAdmin() {
  document.getElementById('adminPanel').classList.remove('active');
  document.getElementById('mainWebsite').style.display = 'block';
  window.scrollTo(0, 0);
}

// ========== PAGINATION & DATA LOADING ==========
async function loadEnquiries(page = 1) {
  currentPage = page;
  const enquiryList = document.getElementById('enquiryList');
  enquiryList.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-light);">Loading enquiries...</p>';
  
  try {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await supabaseClient
      .from('enquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    totalCount = count || 0;
    
    if (!data || data.length === 0) {
      enquiryList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No enquiries found.</p>';
      return;
    }
    
    enquiryList.innerHTML = '';
    data.forEach(enquiry => {
      const enquiryEl = createEnquiryElement(enquiry.id, enquiry);
      enquiryList.appendChild(enquiryEl);
    });
    
    renderPagination();
    
  } catch (error) {
    console.error('Error loading enquiries:', error);
    enquiryList.innerHTML = '<p style="text-align: center; color: red; padding: 40px;">Error loading enquiries.</p>';
  }
}

function renderPagination() {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  if (totalPages <= 1) return;

  const paginationContainer = document.createElement('div');
  paginationContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;';
  
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '← Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.style.cssText = `padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: ${currentPage === 1 ? '#f8f9fa' : 'white'}; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; color: ${currentPage === 1 ? '#aaa' : 'var(--primary-color)'}; font-weight: 600;`;
  prevBtn.onclick = () => loadEnquiries(currentPage - 1);

  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalCount} total)`;
  pageInfo.style.cssText = 'font-size: 0.9rem; color: var(--text-light); font-weight: 500;';

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.style.cssText = `padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: ${currentPage === totalPages ? '#f8f9fa' : 'white'}; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; color: ${currentPage === totalPages ? '#aaa' : 'var(--primary-color)'}; font-weight: 600;`;
  nextBtn.onclick = () => loadEnquiries(currentPage + 1);

  paginationContainer.appendChild(prevBtn);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextBtn);

  document.getElementById('enquiryList').appendChild(paginationContainer);
}

// ========== COMPACT UI RENDERING ==========
function createEnquiryElement(id, data) {
  const div = document.createElement('div');
  div.className = 'enquiry-item';
  div.style.cssText = 'padding: 15px 20px; margin-bottom: 12px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; transition: all 0.2s ease;';
  
  const dateObj = new Date(data.created_at);
  const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  div.innerHTML = `
    <div class="enquiry-header" onclick="toggleEnquiryDetail('${id}')" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
      <div style="flex: 1;">
        <div style="font-weight: 600; color: var(--primary-color); font-size: 1rem;">${data.name}</div>
        <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 2px;">${data.subject} • ${dateStr}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 15px;">
        <span class="enquiry-status status-${data.status || 'new'}" style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background: ${data.status === 'read' ? '#fff3cd' : '#d4edda'}; color: ${data.status === 'read' ? '#856404' : '#155724'};">
          ${data.status || 'new'}
        </span>
        <i class="fas fa-chevron-down" id="icon-${id}" style="color: var(--text-light); transition: transform 0.3s;"></i>
      </div>
    </div>
    
    <div class="enquiry-detail" id="detail-${id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <div style="font-size: 0.7rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Email</div>
          <div style="font-size: 0.95rem; color: var(--text-dark); word-break: break-all;">${data.email}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Phone</div>
          <div style="font-size: 0.95rem; color: var(--text-dark);">${data.phone}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="font-size: 0.7rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">Message</div>
        <div style="font-size: 0.95rem; color: var(--text-dark); background: #f8f9fa; padding: 12px; border-radius: 6px; line-height: 1.5; white-space: pre-wrap; border: 1px solid #eee;">${data.message}</div>
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
        <button onclick="markAsRead('${id}')" class="btn" style="padding: 8px 16px; font-size: 0.85rem; background: var(--primary-color); border: none; border-radius: 6px; color: white; cursor: pointer;">
          <i class="fas fa-check"></i> Mark as Read
        </button>
        <a href="mailto:${data.email}?subject=Re: ${data.subject}" class="btn" style="padding: 8px 16px; font-size: 0.85rem; background: #25D366; color: white; text-decoration: none; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
          <i class="fas fa-reply"></i> Reply
        </a>
        <button onclick="deleteEnquiry('${id}')" class="btn" style="padding: 8px 16px; font-size: 0.85rem; background: var(--accent-color); border: none; border-radius: 6px; color: white; cursor: pointer; margin-left: auto;">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `;
  
  return div;
}

function toggleEnquiryDetail(id) {
  const detail = document.getElementById(`detail-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  if (detail.style.display === 'none' || detail.style.display === '') {
    detail.style.display = 'block';
    if(icon) icon.style.transform = 'rotate(180deg)';
  } else {
    detail.style.display = 'none';
    if(icon) icon.style.transform = 'rotate(0deg)';
  }
}

async function markAsRead(id) {
  try {
    const { error } = await supabaseClient
      .from('enquiries')
      .update({ status: 'read' })
      .eq('id', id);
    
    if (error) throw error;
    loadEnquiries(currentPage); // Reload current page
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Error updating status');
  }
}

async function deleteEnquiry(id) {
  if (!confirm('Are you sure you want to permanently delete this enquiry? This cannot be undone.')) {
    return;
  }
  
  try {
    const { error } = await supabaseClient
      .from('enquiries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // If this was the last item on the page, go back a page
    const currentItems = document.querySelectorAll('.enquiry-item').length;
    let pageToLoad = currentPage;
    if (currentItems === 1 && currentPage > 1) {
      pageToLoad = currentPage - 1;
    }
    
    loadEnquiries(pageToLoad);
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    alert('Error deleting enquiry. Please try again.');
  }
}
// ========== PDF DOWNLOAD FUNCTION ==========
async function downloadPDF() {
  const btn = event.target.closest('button');
  const originalText = btn.innerHTML;
  
  // Show loading state on button
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  try {
    // Fetch ALL enquiries (up to 1000) for the PDF, ignoring pagination
    const { data, error } = await supabaseClient
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;
    if (!data || data.length === 0) {
      alert('No enquiries available to download.');
      return;
    }

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Company Header
    doc.setFontSize(20);
    doc.setTextColor(26, 43, 60); // Navy blue
    doc.text('Arinola Multipurpose Global Ltd', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Customer Enquiries Report', 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
    doc.setDrawColor(243, 156, 18); // Orange line
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // Prepare data for the table
    const tableData = data.map(item => {
      const date = new Date(item.created_at).toLocaleDateString();
      return [
        date,
        item.name,
        item.email,
        item.phone,
        item.subject,
        (item.status || 'new').toUpperCase(),
        item.message
      ];
    });

    // Generate the AutoTable
    doc.autoTable({
      startY: 42,
      head: [['Date', 'Name', 'Email', 'Phone', 'Subject', 'Status', 'Message']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [243, 156, 18], // Orange header
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        overflow: 'linebreak' // Wraps long text automatically
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Date
        1: { cellWidth: 30 }, // Name
        2: { cellWidth: 40 }, // Email
        3: { cellWidth: 25 }, // Phone
        4: { cellWidth: 30 }, // Subject
        5: { cellWidth: 20 }, // Status
        6: { cellWidth: 'auto' } // Message takes the rest
      }
    });

    // Save the file
    const fileName = `Arinola_Enquiries_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('PDF Error:', error);
    alert('Failed to generate PDF. Please check your internet connection.');
  } finally {
    // Restore button state
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}
// Update year
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}