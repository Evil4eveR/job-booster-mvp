import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CVDraftPreview } from './CVDraftPreview';

describe('CVDraftPreview', () => {
  it('renders without crashing', () => {
    const { container } = render(<CVDraftPreview content="Personal Data" />);
    expect(container).toBeTruthy();
  });

  it('renders the provided content', () => {
    render(<CVDraftPreview content="Name: Max Mustermann" />);
    expect(screen.getByText("Name: Max Mustermann")).toBeTruthy();
  });

  it('renders fallback when content is empty', () => {
    render(<CVDraftPreview content="" />);
    expect(screen.getByText("No content generated for this section.")).toBeTruthy();
  });
});
