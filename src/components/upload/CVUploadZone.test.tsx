import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CVUploadZone } from './CVUploadZone';
import { useApplicationStore } from '@/stores/applicationStore';
import { useUiStore } from '@/stores/uiStore';

describe('CVUploadZone', () => {
  beforeEach(() => {
    useApplicationStore.getState().reset();
    useUiStore.getState().reset();
  });

  it('renders without crashing', () => {
    const { container } = render(<CVUploadZone />);
    expect(container).toBeTruthy();
  });

  it('renders the CV / Resume card title', () => {
    render(<CVUploadZone />);
    expect(screen.getByText('Your CV / Resume')).toBeTruthy();
  });

  it('renders the upload zone by default', () => {
    render(<CVUploadZone />);
    expect(screen.getByText(/Click to upload/)).toBeTruthy();
  });
});
