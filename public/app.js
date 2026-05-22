const inputSection = document.getElementById('input-section');
const paymentSection = document.getElementById('payment-section');
const loadingSection = document.getElementById('loading-section');
const outputSection = document.getElementById('output-section');

const cvFileInput = document.getElementById('cv-file-input');
const fileLabelText = document.getElementById('file-label-text');
const jobInput = document.getElementById('job-input');
const inputLang = document.getElementById('input-lang');
const outputText = document.getElementById('output-text');

// Visual display update when a user chooses a PDF file
cvFileInput.addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        fileLabelText.innerHTML = `📄 <span class="font-semibold text-blue-600">${e.target.files[0].name}</span> selected`;
    }
});

// Proceed button checkout gateway
document.getElementById('proceed-btn').addEventListener('click', () => {
    if (cvFileInput.files.length === 0 || !jobInput.value.trim()) {
        alert("Please upload your CV PDF file and paste the job advertisement text first.");
        return;
    }
    inputSection.classList.add('hidden');
    paymentSection.classList.remove('hidden');
});

document.getElementById('back-btn').addEventListener('click', () => {
    paymentSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
});

// Upgraded Multi-part Multi-Form testing route
async function forceSimulateSuccessfulPayment(mockId = "MOCK_PAYMENT_TX_PDF_8888") {
    console.log(`[PIPELINE]: Transmission initialized via transaction ID: ${mockId}. Packaging multipart forms...`);
    
    paymentSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    // Create standard form data boundaries for binary handling
    const formData = new FormData();
    formData.append('cvFile', cvFileInput.files[0]);
    formData.append('jobDescription', jobInput.value);
    formData.append('inputLanguage', inputLang.value);
    formData.append('paymentId', mockId);

    try {
        const response = await fetch('/api/generate-application', {
            method: 'POST',
            body: formData // Notice: No JSON headers needed. Browser calculates Multi-part bound boundaries automatically.
        });

        const result = await response.json();
        loadingSection.classList.add('hidden');

        if (result.success) {
            console.log("[PIPELINE SUCCESS]: Extracted PDF response processed safely directly to layout window.");
            outputText.value = result.data;
            outputSection.classList.remove('hidden');
        } else {
            console.error("[PIPELINE FAILURE]: Payload error rejection:", result.error);
            alert("Application Processing Error: " + result.error);
            inputSection.classList.remove('hidden');
        }
    } catch (error) {
        console.error("[PIPELINE FATAL EXCEPTION]: Web server endpoint connection dropped:", error.message);
        loadingSection.classList.add('hidden');
        alert("Network communication failure. Ensure node server.js is running cleanly.");
        inputSection.classList.remove('hidden');
    }
}

window.forceSimulateSuccessfulPayment = forceSimulateSuccessfulPayment;