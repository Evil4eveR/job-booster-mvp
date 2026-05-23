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
    previewTextPane.textContent = preview.coverLetterPreview;
    
    previewKeywordsTags.innerHTML = '';
    preview.keywords.forEach(kw => {
      const tag = document.createElement('span');
      tag.className = "bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-600/50";
      tag.textContent = kw;
      previewKeywordsTags.appendChild(tag);
    });

    previewAtsBullets.innerHTML = '';
    preview.atsSuggestions.forEach(sug => {
      const li = document.createElement('li');
      li.textContent = sug;
      previewAtsBullets.appendChild(li);
    });

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

    fullTextDisplayPane.textContent = `=== TAILORED GERMAN COVER LETTER (ANSCHREIBEN) ===\n\n${payload.coverLetter}\n\n\n=== OPTIMIZED ATS RESUME LAYOUT STRUCTURAL TRACKING BLUEPRINT ===\n\n${payload.optimizedCvDraft}`;

    // Configure explicit tracking routing hooks mappings bindings rules
    setupDownloadButtonsRoutingHooks(appState.currentTrackingId);
  }

  function setupDownloadButtonsRoutingHooks(trackingId) {
    document.getElementById('dl-cl-pdf').onclick = () => window.open(`/api/ai/download/pdf/coverletter/${trackingId}`, '_blank');
    document.getElementById('dl-cl-txt').onclick = () => window.open(`/api/ai/download/txt/coverletter/${trackingId}`, '_blank');
    document.getElementById('dl-cv-pdf').onclick = () => window.open(`/api/ai/download/pdf/cvdraft/${trackingId}`, '_blank');
    document.getElementById('dl-cv-txt').onclick = () => window.open(`/api/ai/download/txt/cvdraft/${trackingId}`, '_blank');
  }

  resetAppBtn.addEventListener('click', () => {
    form.reset();
    appState.selectedFile = null;
    fileBadge.classList.add('hidden');
    dropZone.querySelector('.space-y-2').classList.remove('hidden');
    Components.toggleView('input-view');
  });
});