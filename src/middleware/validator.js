export const validateGenerationInput = (req, res, next) => {
  const { jobDescription } = req.body;
  
  if (!jobDescription || jobDescription.trim().length < 20) {
    return res.status(400).json({
      success: false,
      message: 'A valid German job description (at least 20 characters long) is required.'
    });
  }
  
  next();
};