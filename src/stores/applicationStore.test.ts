import { describe, it as test, expect, beforeEach } from 'vitest';
import { useApplicationStore } from "./applicationStore";
import type { Step, InputMode } from "./applicationStore";

// ============================================================
// Helper: Reset store before each test
// ============================================================

beforeEach(() => {
  useApplicationStore.getState().reset();
});

// ============================================================
// Initial state values
// ============================================================

describe("applicationStore — initial state", () => {
  test("step defaults to 'input'", () => {
    expect(useApplicationStore.getState().step).toBe("input");
  });

  test("inputMode defaults to 'upload'", () => {
    expect(useApplicationStore.getState().inputMode).toBe("upload");
  });

  test("uploadedFile defaults to null", () => {
    expect(useApplicationStore.getState().uploadedFile).toBeNull();
  });

  test("extractedText defaults to empty string", () => {
    expect(useApplicationStore.getState().extractedText).toBe("");
  });

  test("pastedCvText defaults to empty string", () => {
    expect(useApplicationStore.getState().pastedCvText).toBe("");
  });

  test("jobDescription defaults to empty string", () => {
    expect(useApplicationStore.getState().jobDescription).toBe("");
  });

  test("inputLanguage defaults to 'auto'", () => {
    expect(useApplicationStore.getState().inputLanguage).toBe("auto");
  });

  test("manualInfo defaults to all empty strings", () => {
    const { manualInfo } = useApplicationStore.getState();
    const keys = Object.keys(manualInfo) as Array<keyof ManualInfo>;
    for (const key of keys) {
      expect(manualInfo[key]).toBe("");
    }
  });

  test("generatedContent defaults to null", () => {
    expect(useApplicationStore.getState().generatedContent).toBeNull();
  });

  test("paymentOrderId defaults to empty string", () => {
    expect(useApplicationStore.getState().paymentOrderId).toBe("");
  });

  test("activeResultTab defaults to 'cover-letter'", () => {
    expect(useApplicationStore.getState().activeResultTab).toBe("cover-letter");
  });

  test("isDragOver defaults to false", () => {
    expect(useApplicationStore.getState().isDragOver).toBe(false);
  });
});

// ============================================================
// getCvText builds correct text for each inputMode
// ============================================================

describe("applicationStore — getCvText", () => {
  test("returns extractedText when inputMode is 'upload'", () => {
    const store = useApplicationStore.getState();
    store.setExtractedText("This is extracted text from a PDF.");
    store.setInputMode("upload");
    expect(useApplicationStore.getState().getCvText()).toBe(
      "This is extracted text from a PDF."
    );
  });

  test("returns pastedCvText when inputMode is 'paste'", () => {
    const store = useApplicationStore.getState();
    store.setPastedCvText("This is pasted CV content.");
    store.setInputMode("paste");
    expect(useApplicationStore.getState().getCvText()).toBe(
      "This is pasted CV content."
    );
  });

  test("builds text from manualInfo fields when inputMode is 'manual'", () => {
    const store = useApplicationStore.getState();
    store.setInputMode("manual");
    store.setManualInfoField("name", "Max Mustermann");
    store.setManualInfoField("email", "max@example.com");
    store.setManualInfoField("skills", "JavaScript, React, Node.js");
    store.setManualInfoField("experience", "Senior Dev at Company X");

    const cvText = useApplicationStore.getState().getCvText();
    expect(cvText).toContain("Name: Max Mustermann");
    expect(cvText).toContain("Email: max@example.com");
    expect(cvText).toContain("Skills: JavaScript, React, Node.js");
    expect(cvText).toContain("Experience: Senior Dev at Company X");
    // Empty fields should not appear
    expect(cvText).not.toContain("Address:");
    expect(cvText).not.toContain("GitHub:");
    expect(cvText).not.toContain("LinkedIn:");
    expect(cvText).not.toContain("Education:");
  });

  test("returns empty string for manual mode when all fields are empty", () => {
    const store = useApplicationStore.getState();
    store.setInputMode("manual");
    expect(useApplicationStore.getState().getCvText()).toBe("");
  });

  test("each manual field appears on its own line", () => {
    const store = useApplicationStore.getState();
    store.setInputMode("manual");
    store.setManualInfoField("name", "Alice");
    store.setManualInfoField("email", "alice@test.com");
    const cvText = useApplicationStore.getState().getCvText();
    const lines = cvText.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("Name: Alice");
    expect(lines[1]).toBe("Email: alice@test.com");
  });
});

// ============================================================
// reset() clears all state back to defaults
// ============================================================

describe("applicationStore — reset", () => {
  test("resets all state to initial values", () => {
    const store = useApplicationStore.getState();

    // Mutate everything
    store.setStep("results");
    store.setInputMode("manual");
    store.setUploadedFile(new File(["test"], "cv.pdf", { type: "application/pdf" }));
    store.setExtractedText("extracted");
    store.setPastedCvText("pasted");
    store.setJobDescription("Job description text");
    store.setInputLanguage("German");
    store.setManualInfoField("name", "Test User");
    store.setManualInfoField("skills", "TypeScript");
    store.setGeneratedContent({
      id: "gen-1",
      coverLetter: "Dear Sir/Madam",
      cvKeywords: "keywords",
      atsSuggestions: "tips",
      generatedCv: "cv content",
    });
    store.setPaymentOrderId("order-123");
    store.setActiveResultTab("cv-draft");
    store.setIsDragOver(true);

    // Reset
    store.reset();

    // Verify all back to defaults
    const state = useApplicationStore.getState();
    expect(state.step).toBe("input");
    expect(state.inputMode).toBe("upload");
    expect(state.uploadedFile).toBeNull();
    expect(state.extractedText).toBe("");
    expect(state.pastedCvText).toBe("");
    expect(state.jobDescription).toBe("");
    expect(state.inputLanguage).toBe("auto");
    expect(state.manualInfo.name).toBe("");
    expect(state.manualInfo.skills).toBe("");
    expect(state.generatedContent).toBeNull();
    expect(state.paymentOrderId).toBe("");
    expect(state.activeResultTab).toBe("cover-letter");
    expect(state.isDragOver).toBe(false);
  });

  test("reset creates a fresh manualInfo object (no reference sharing)", () => {
    const store = useApplicationStore.getState();
    store.setManualInfoField("name", "Original");
    store.reset();

    // Modify manualInfo after reset
    store.setManualInfoField("name", "Modified");

    // Reset again and verify it goes back to empty
    store.reset();
    expect(useApplicationStore.getState().manualInfo.name).toBe("");
  });
});

// ============================================================
// setManualInfoField updates individual fields correctly
// ============================================================

describe("applicationStore — setManualInfoField", () => {
  test("updates a single field without affecting others", () => {
    const store = useApplicationStore.getState();
    store.setManualInfoField("name", "Jane Doe");
    store.setManualInfoField("email", "jane@example.com");

    const { manualInfo } = useApplicationStore.getState();
    expect(manualInfo.name).toBe("Jane Doe");
    expect(manualInfo.email).toBe("jane@example.com");
    // Other fields should remain at default
    expect(manualInfo.address).toBe("");
    expect(manualInfo.github).toBe("");
  });
});

// ============================================================
// Step transitions
// ============================================================

describe("applicationStore — step transitions", () => {
  const steps: Step[] = ["input", "payment", "generating", "results"];

  for (const step of steps) {
    test(`setStep("${step}") updates step correctly`, () => {
      useApplicationStore.getState().setStep(step);
      expect(useApplicationStore.getState().step).toBe(step);
    });
  }
});

// ============================================================
// Input mode transitions
// ============================================================

describe("applicationStore — inputMode transitions", () => {
  const modes: InputMode[] = ["upload", "paste", "manual"];

  for (const mode of modes) {
    test(`setInputMode("${mode}") updates inputMode correctly`, () => {
      useApplicationStore.getState().setInputMode(mode);
      expect(useApplicationStore.getState().inputMode).toBe(mode);
    });
  }
});
