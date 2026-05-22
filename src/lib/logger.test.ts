import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('logs info messages with structured format', () => {
    logger.info('Test message', 'TestContext');
    expect(console.info).toHaveBeenCalled();
    const logCall = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test message');
    expect(parsed.context).toBe('TestContext');
  });

  it('logs error messages', () => {
    logger.error('Error occurred', 'API', { code: 500 });
    expect(console.error).toHaveBeenCalled();
  });

  it('includes timestamp in log entries', () => {
    logger.info('Test');
    const logCall = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.timestamp).toBeTruthy();
  });
});
