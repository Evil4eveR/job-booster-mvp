document.addEventListener('DOMContentLoaded', () => {
  // Application Dynamic Component State Scope Tracking Context Keys Definitions Engine Data Maps
  let appState = {
    currentTrackingId: null,
    selectedFile: null,
    inputMode: 'upload' // 'upload' or 'manual'
  };

  // UI Element Selectors DOM Mapping Matrix Reference Hooks Context
  const form = document.getElementById('generator-form');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileBadge = document.getElementById('file-badge');
  const fileBadgeName = document.getElementById('file-badge-name');
  const removeFileBtn = document.getElementById('remove-file-btn');
  
  const toggleUploadBtn = document.getElementById('toggle-upload-btn');
  const toggleManualBtn = document.getElementById('toggle-manual-btn');
  const uploadWrapperBox = document.getElementById('upload-wrapper-box');
  const manualInputBox = document.getElementById('manual-input-box');

  const previewTextPane = document.getElementById('preview-text-pane');
  const previewKeywordsTags = document.getElementById('preview-keywords-tags');
  const previewAtsBullets = document.getElementById('preview-ats-bullets');
  const fullTextDisplayPane = document.getElementById('full-text-display-pane');
  
  const checkoutPayLockPane = document.getElementById('checkout-pay-lock-pane');
  const unlockedDownloadPane = document.getElementById('unlocked-download-pane');
  const resetAppBtn = document.getElementById('reset-app-btn');

  // Input view toggle orchestration flow routines settings context handlers
  toggleUploadBtn.addEventListener('click', () => {
    appState.inputMode = 'upload';
    toggleUploadBtn.className = "py-3 px-4 rounded-xl border-2 border-indigo-500 bg-indigo-500/10 font-medium text-white transition";
    toggleManualBtn.className = "py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/50 font-medium text-slate-400 hover:text-white hover:border-slate-600 transition";
    uploadWrapperBox.classList.remove('hidden');
    manualInputBox.classList.add('hidden');
  });

  toggleManualBtn.addEventListener('click', () => {
    appState.inputMode = 'manual';
    toggleManualBtn.className = "py-3 px-4 rounded-xl border-2 border-indigo-500 bg-indigo-500/10 font-medium text-white transition";
    toggleUploadBtn.className = "py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/50 font-medium text-slate-400 hover:text-white hover:border-slate-600 transition";
    manualInputBox.classList.remove('hidden');
    uploadWrapperBox.classList.add('hidden');
  });

  // Drag and drop processing event registration logic listeners loop blocks items
  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-indigo-500', 'bg-indigo-500/5');
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('border-indigo-500', 'bg-indigo-500/5');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appState.selectedFile = null;
    fileInput.value = '';
    fileBadge.classList.add('hidden');
    dropZone.querySelector('.space-y-2').classList.remove('hidden');
  });

  function handleFileSelection(file) {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.mimetype) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      Components.showNotification('Unsupported format file selection context rules logic.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Components.showNotification('Target processing sizing rules layout parameters error limits crossed (Max 5MB sizing allowed).', 'error');
      return;
    }
    appState.selectedFile = file;
    fileBadgeName.textContent = file.name;
    fileBadge.classList.remove('hidden');
    dropZone.querySelector('.space-y-2').classList.add('hidden');
  }

  // Submit configuration trigger logic block intercept execution pipeline matrix routines
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('jobDescription', document.getElementById('job-desc').value);
    formData.append('languageSelection', document.getElementById('lang-select').value);

    if (appState.inputMode === 'upload') {
      if (!appState.selectedFile) {
        Components.showNotification('Please add a resume file to run optimization analysis processing flow loops.', 'error');
        return;
      }
      formData.append('resumeFile', appState.selectedFile);
    } else {
      const manualProfile = {
        name: document.getElementById('manual-name').value,
        email: document.getElementById('manual-email').value,
        address: document.getElementById('manual-address').value,
        github: document.getElementById('manual-github').value,
        linkedin: document.getElementById('manual-linkedin').value,
        skills: document.getElementById('manual-skills').value,
        experience: document.getElementById('manual-experience').value,
        education: document.getElementById('manual-education').value,
      };
      
      if (!manualProfile.skills || !manualProfile.experience) {
        Components.showNotification('Please fill in your skills and experience fields to build your profile.', 'error');
        return;
      }
      formData.append('manualProfile', JSON.stringify(manualProfile));
    }

    try {
      Components.toggleView('loading-view');
      const networkDataResponse = await ApiClient.generateAssets(formData);
      
      appState.currentTrackingId = networkDataResponse.trackingId;
      renderPreviewDashboard(networkDataResponse.preview);
      Components.toggleView('results-view');
      Components.showNotification('AI Strategy compilation package assets built successfully!', 'success');
    } catch (err) {
      Components.toggleView('input-view');
      Components.showNotification(err.message || 'Processing engine failure runtime context operational issue.', 'error');
    }
  });

function renderPreviewDashboard(preview) {
    // 1. Build a clean, multi-paragraph preview layout for the cover letter
    const cl = preview.coverLetter;
    
    // Joint the array of body paragraphs into spaced text blocks
    const paragraphHTML = cl.bodyParagraphs.map(p => `<p class="mb-4 text-slate-300 leading-relaxed">${p}</p>`).join('');
    
    // Inject the structured layout directly into your preview viewport pane
    previewTextPane.innerHTML = `
      <div class="text-sm text-slate-400 mb-2">${cl.senderName} • ${cl.senderContact}</div>
      <div class="text-sm text-slate-400 mb-4"><strong>To:</strong> ${cl.recipientCompany}</div>
      <h3 class="text-md font-bold text-white mb-4">${cl.subjectLine}</h3>
      <p class="mb-4 text-slate-300">${cl.salutation}</p>
      ${paragraphHTML}
      <p class="text-slate-300 mt-4">${cl.signOff}</p>
      <p class="text-slate-300 font-semibold">${cl.senderName}</p>
    `;
    
    // 2. Loop through and print out the matched ATS keywords
    previewKeywordsTags.innerHTML = '';
    const keywordsList = preview.tailoredCV.atsKeywordsMatched || [];
    keywordsList.forEach(kw => {
      const tag = document.createElement('span');
      tag.className = "bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-md border border-indigo-500/20 font-medium";
      tag.textContent = kw;
      previewKeywordsTags.appendChild(tag);
    });

    // 3. Clear out old suggestions bullet container or use it to show the executive summary
    previewAtsBullets.innerHTML = `
      <li class="text-slate-300 list-none italic border-l-2 border-indigo-500 pl-3">
        <strong>Target Executive Summary:</strong> ${preview.tailoredCV.summary}
      </li>
    `;

    checkoutPayLockPane.classList.remove('hidden');
    unlockedDownloadPane.classList.add('hidden');
    
    // Set up clear mounts updates actions handlers calls definitions elements
    mountPayPalExpressCheckoutButton(appState.currentTrackingId);
  }

  function mountPayPalExpressCheckoutButton(trackingId) {
    const btnContainer = document.getElementById('paypal-button-container');
    btnContainer.innerHTML = ''; // Prevent duplication errors loops components layers mountings routines
    
    if (typeof paypal === 'undefined') {
      console.error('PayPal SDK loading parameters trace logic block configuration missing.');
      return;
    }

    paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: '4.99', currency_code: 'EUR' }
          }]
        });
      },
      onApprove: async (data, actions) => {
        return actions.order.capture().then(async (details) => {
          try {
            const verificationPayload = await ApiClient.verifyUnlock(trackingId, details.id);
            Components.showNotification('Payment processed successfully. Document assets unlocked.', 'success');
            revealFullUnlockedPayloadData(verificationPayload.payload);
          } catch (err) {
            Components.showNotification('Error processing backend digital token clearance validation checks routes.', 'error');
          }
        });
      },
      onError: (err) => {
        console.error('PayPal Processing Error Exception Trace Interface Event:', err);
        Components.showNotification('Checkout processing gateway encountered an unexpected structural communication exception.', 'error');
      }
    }).render('#paypal-button-container');
  }

function revealFullUnlockedPayloadData(payload) {
    checkoutPayLockPane.classList.add('hidden');
    unlockedDownloadPane.classList.remove('hidden');

    const cl = payload.coverLetter || {};
    const cv = payload.tailoredCV || {};

    // 1. Compile and Render the Premium Cover Letter Sheet using our separate function
    const targetSheetContainer = document.getElementById('cover-letter-target-sheet');
    if (targetSheetContainer) {
      targetSheetContainer.innerHTML = compilePremiumCoverLetterHTML(cl);
    }

    // 2. Render the Right-Hand CV Blueprint Matrix Elements
    document.getElementById('matrix-cv-name').textContent = cv.fullName || 'Candidate Profile';
    document.getElementById('matrix-cv-title').textContent = cv.professionalTitle || 'Software Professional';
    document.getElementById('matrix-cv-summary').textContent = cv.summary || '';

    // Render Experience structural blocks dynamically
    const expContainer = document.getElementById('matrix-cv-experience');
    expContainer.innerHTML = '';
    const experiences = Array.isArray(cv.tailoredExperience) ? cv.tailoredExperience : [];
    
    experiences.forEach(exp => {
      const block = document.createElement('div');
      block.className = "p-3.5 bg-slate-900/50 border border-slate-700/40 rounded-lg space-y-1.5";
      
      const achievementsHTML = Array.isArray(exp.achievements) 
        ? exp.achievements.map(a => `<li class="text-xs text-slate-300 pl-1">• ${a}</li>`).join('') 
        : '';

      block.innerHTML = `
        <div class="flex justify-between items-start">
          <h5 class="text-sm font-bold text-white">${exp.role}</h5>
          <span class="text-[10px] bg-slate-800 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/10">${exp.duration}</span>
        </div>
        <p class="text-xs text-slate-400">${exp.company}</p>
        <ul class="space-y-1 mt-1.5 list-none">${achievementsHTML}</ul>
      `;
      expContainer.appendChild(block);
    });

    // Configure download buttons
    setupDownloadButtonsRoutingHooks(appState.currentTrackingId);
  }

function setupDownloadButtonsRoutingHooks(trackingId) {
  document.getElementById('dl-cl-pdf').onclick = function() {
    window.location.href = `/api/ai/download/pdf/coverletter/${trackingId}`;
  };
}

  resetAppBtn.addEventListener('click', () => {
    form.reset();
    appState.selectedFile = null;
    fileBadge.classList.add('hidden');
    dropZone.querySelector('.space-y-2').classList.remove('hidden');
    Components.toggleView('input-view');
  });
  function compilePremiumCoverLetterHTML(cl) {
  const paragraphs = Array.isArray(cl.bodyParagraphs) ? cl.bodyParagraphs : [];
  const bodyParagraphsHTML = paragraphs
    .map(p => `<p class="text-justify leading-relaxed text-slate-800 tracking-tight font-normal mb-4 text-xs sm:text-sm">${p}</p>`)
    .join('');

  return `
    <div class="bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-200 relative mx-auto" 
         style="width: 100%; max-width: 595px; min-height: 842px; padding: 50px 50px 50px 55px; font-family: 'Times New Roman', Times, serif; box-sizing: border-box;">
      
      <div class="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
      
      <div class="border-b border-slate-100 pb-3 mb-6 flex justify-between items-start">
        <div class="space-y-0.5">
          <h2 class="text-base font-bold tracking-wide uppercase text-slate-900 font-sans">${cl.senderName || 'Your Name'}</h2>
          <p class="text-[11px] text-slate-500 font-sans tracking-tight">${cl.senderContact || ''}</p>
        </div>
        <div class="text-right font-sans text-[9px] font-bold text-slate-400 tracking-widest uppercase pt-1">
          DIN 5008 Layout
        </div>
      </div>

      <div class="mb-8 text-xs font-sans text-slate-700 space-y-0.5 max-w-sm">
        <span class="text-[9px] font-bold tracking-wider text-indigo-500 uppercase block mb-1">Empfänger</span>
        <div class="font-medium text-slate-900 bg-slate-50 border-l-2 border-slate-300 p-2.5 rounded-sm italic leading-tight">
          ${cl.recipientCompany || 'Target Company Name'}
        </div>
      </div>

      <div class="mb-5">
        <h3 class="text-sm font-bold text-slate-900 font-sans tracking-tight leading-snug">
          ${cl.subjectLine || 'Bewerbung'}
        </h3>
      </div>

      <div class="space-y-3">
        <p class="text-xs sm:text-sm font-bold text-slate-900 font-sans mb-3">${cl.salutation || 'Sehr geehrte Damen und Herren,'}</p>
        <div class="font-serif">${bodyParagraphsHTML}</div>
        <div class="pt-3 space-y-1 font-sans">
          <p class="text-xs sm:text-sm text-slate-800">${cl.signOff || 'Mit freundlichen Grüßen'}</p>
          <div class="pt-4">
            <p class="text-xs sm:text-sm font-bold text-slate-900 border-t border-slate-200 pt-1 inline-block min-w-[140px]">${cl.senderName || ''}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  }
});