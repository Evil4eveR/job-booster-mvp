import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoverLetterPreview } from './CoverLetterPreview';

describe('CoverLetterPreview', () => {
  it('renders without crashing', () => {
    const { container } = render(<CoverLetterPreview content="Test cover letter" />);
    expect(container).toBeTruthy();
  });

  it('renders the provided content', () => {
    render(<CoverLetterPreview content="Hello, this is a test cover letter." />);
    expect(screen.getByText("Hello, this is a test cover letter.")).toBeTruthy();
  });

  it('renders fallback when content is empty', () => {
    render(<CoverLetterPreview content="" />);
    expect(screen.getByText("No content generated for this section.")).toBeTruthy();
  });
});
