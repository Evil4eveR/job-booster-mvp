import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CVKeywordsPanel } from './CVKeywordsPanel';

describe('CVKeywordsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CVKeywordsPanel content="React, TypeScript" />);
    expect(container).toBeTruthy();
  });

  it('renders the provided content', () => {
    render(<CVKeywordsPanel content="Frontend-Entwicklung" />);
    expect(screen.getByText("Frontend-Entwicklung")).toBeTruthy();
  });

  it('renders fallback when content is empty', () => {
    render(<CVKeywordsPanel content="" />);
    expect(screen.getByText("No content generated for this section.")).toBeTruthy();
  });
});
