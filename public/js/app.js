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
  // for dev mode
  const IS_DEV_MODE = false;
  // Submit configuration trigger logic block intercept execution pipeline matrix routines
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
  if (IS_DEV_MODE) {
    // بيانات وهمية تحاكي تماماً ما يرسله السيرفر لتجربة التصميم مجاناً
    const mockNetworkResponse = {
      trackingId: "test_track_12345",
      preview: {
        coverLetter: {
          senderName: "Max Mustermann",
          senderContact: "Musterstraße 1, 12345 Musterstadt • +49 176 1234567",
          recipientCompany: "Beispielfirma GmbH\nPersonalabteilung\nTech-Allee 10",
          subjectLine: "Bewerbung als Mitarbeiter im 2nd Level Support",
          salutation: "Sehr geehrte Damen und Herren,",
          bodyParagraphs: [
            "mit großem Interesse habe ich Ihre Stellenausschreibung für den 2nd Level Support analysiert. Als erfahrener IT-Spezialist bringe ich fundierte Kenntnisse in Linux Systemadministration und containerisierten Architekturen mit.",
            "In meiner täglichen Praxis löse ich komplexe technische Vorfälle unter strikter Einhaltung von SLAs. Ich freue يعني هنا النص سيكون مخفي ومطمس تماماً في المعاينة حتى يضغط المستخدم على الدفع."
          ],
          signOff: "Mit freundlichen Grüßen"
        },
        tailoredCV: {
          atsKeywordsMatched: ["Linux", "Ubuntu", "Docker", "SLA", "IT-Support", "Troubleshooting"],
          summary: "Erfahrener IT Engineer mit starkem Fokus auf automatisierte Infrastrukturen وتقديم دعم فني متقدم من المستوى الثاني."
        }
      }
    };
    // تشغيل نفس دالة الرندر التي تعبنا في ضبط حجمها ومحاذاتها
    renderPreviewDashboard(mockNetworkResponse.preview);
    Components.toggleView('results-view');
    return; // إنهاء التنفيذ هنا لمنع الاتصال بالإنترنت واستهلاك الرصيد!
  }

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
  
    if (!IS_DEV_MODE) {
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
  }
  });

function renderPreviewDashboard(preview) {
    const cl = preview.coverLetter || {};
    const bodyParagraphs = Array.isArray(cl.bodyParagraphs) ? cl.bodyParagraphs : [];
    
    // 1. Render background text rows with explicit selection blocks and high-density blur filters
    const paragraphHTML = bodyParagraphs.map((p, idx) => {
      if (idx === 0) {
        return `<p class="mb-3 text-slate-500 text-xs select-none pointer-events-none">${p.substring(0, 40)}... <span class="blur-[5px] select-none">${p.substring(40)}</span></p>`;
      }
      return `<p class="mb-3 text-slate-500 text-xs blur-[6px] select-none pointer-events-none tracking-tight">${p}</p>`;
    }).join('');
    
    // 2. Establish uniform bounding boxes on the preview text container (Fixed height match)
    previewTextPane.className = "bg-slate-950/90 rounded-xl p-5 font-mono text-xs text-slate-400 leading-relaxed h-[520px] overflow-hidden relative border border-slate-900 select-none";
    previewTextPane.innerHTML = `
      <div class="border-b border-slate-800 pb-2.5 mb-3 opacity-40">
        <div class="text-[10px] font-bold tracking-wide text-indigo-400 uppercase font-sans mb-0.5">Sender Profile Context</div>
        <div class="text-xs text-slate-200 font-bold">${cl.senderName || 'Candidate Profile'}</div>
        <div class="text-[10px] text-slate-500 font-mono">${cl.senderContact || ''}</div>
      </div>
      
      <div class="mb-3 opacity-20">
        <div class="text-[10px] font-bold tracking-wide text-slate-500 uppercase font-sans mb-0.5">Empfänger (Recipient)</div>
        <div class="text-xs text-slate-400 font-sans italic">${cl.recipientCompany || 'Target Company'}</div>
      </div>
      
      <div class="mb-2 border-t border-slate-800/60 pt-2.5 opacity-20">
        <p class="mb-2 text-slate-400 font-sans font-semibold text-xs">${cl.salutation || 'Sehr geehrte Damen und Herren,'}</p>
      </div>

      <div class="space-y-2 relative pr-1 opacity-20">
        ${paragraphHTML}
      </div>

      <div class="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/40 flex flex-col justify-center items-center p-6 text-center">
        <div class="space-y-2 mb-4">
          <span class="inline-flex bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            🔒 DIN 5008 Artifact Locked
          </span>
          <h3 class="text-xl font-black text-white tracking-tight">Unlock Ready Assets</h3>
          <p class="text-slate-400 text-xs max-w-[240px] mx-auto leading-normal">Your high-density German cover letter and matching keyword configurations matrix are fully optimized.</p>
        </div>
        
        <div class="bg-slate-900/90 border border-slate-800/80 rounded-xl py-1.5 px-6 mb-4 shadow-xl">
          <div class="text-xl font-black text-emerald-400">€4.99</div>
        </div>
        
        <div id="paypal-button-container" class="max-w-[240px] w-full mx-auto"></div>
      </div>
    `;
    
    // 3. Delegate keywords mapping directly to Components
    const keywordsList = (preview.tailoredCV && preview.tailoredCV.atsKeywordsMatched) || [];
    Components.renderKeywords(keywordsList);

    // 4. Update the right metrics column wrapper to use a matching h-[520px] fixed box layout frame
    const rightSidebarContainer = previewKeywordsTags.closest('.bg-slate-800\\/40') || previewKeywordsTags.parentElement;
    if (rightSidebarContainer) {
      rightSidebarContainer.className = "bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm h-[520px] flex flex-col justify-between overflow-y-auto scrollbar-thin";
    }

    // 5. Unpack structural analytical points dynamically
    const cvData = preview.tailoredCV || {};
    const structuralGuidelines = [];
    if (cvData.summary) {
      structuralGuidelines.push(`<strong>Target Profile Summary Strategy:</strong> ${cvData.summary}`);
    }
    if (Array.isArray(cvData.atsSuggestions)) {
      cvData.atsSuggestions.forEach(s => structuralGuidelines.push(s));
    } else {
      structuralGuidelines.push("All core systems administration and low-level compliance metrics analyzed successfully.");
    }
    Components.renderATSBullets(structuralGuidelines);

    // Hide old decoupled card block
    checkoutPayLockPane.classList.add('hidden');
    unlockedDownloadPane.classList.add('hidden');
    
    // Initialize secure verification gateway hooks rendering engine
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
  // 1. ربط زر تحميل ملف الـ PDF الجاهز بالرابط الخلفي الصحيح
  document.getElementById('dl-cl-pdf').onclick = function() {
    window.location.href = `/api/ai/download/pdf/coverletter/${trackingId}`;
  };

  // 2. ربط زر تحميل ملف الـ Word (DOCX) الجديد بالرابط الخلفي المحدث
  const docxButton = document.getElementById('dl-cl-docx');
  if (docxButton) {
    docxButton.onclick = function() {
      window.location.href = `/api/ai/download/docx/coverletter/${trackingId}`;
    };
  }
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