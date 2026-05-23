const ApiClient = {
  async generateAssets(formData) {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        body: formData 
      });

      if (!response.ok) {
        throw new Error(`Server status error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  },

  // 🔓 Added this missing connection hook function for payment bypass state verification
  async verifyUnlock(trackingId, paymentId) {
    try {
      const response = await fetch('/api/ai/verify-unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trackingId, paymentId })
      });

      if (!response.ok) {
        throw new Error(`Verification route clearance check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Unlock check failed:", error);
      throw error;
    }
  }
};

window.ApiClient = ApiClient;