import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ATSSuggestions } from './ATSSuggestions';

describe('ATSSuggestions', () => {
  it('renders without crashing', () => {
    const { container } = render(<ATSSuggestions content="Add keywords" />);
    expect(container).toBeTruthy();
  });

  it('renders the provided content', () => {
    render(<ATSSuggestions content="Match-Rate: 75%" />);
    expect(screen.getByText("Match-Rate: 75%")).toBeTruthy();
  });

  it('renders fallback when content is empty', () => {
    render(<ATSSuggestions content="" />);
    expect(screen.getByText("No content generated for this section.")).toBeTruthy();
  });
});
