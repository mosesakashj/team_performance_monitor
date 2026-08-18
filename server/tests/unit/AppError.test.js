import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/utils/AppError.js';

describe('AppError', () => {
  it('is an instance of Error', () => {
    const err = new AppError(404, 'not found');
    expect(err).toBeInstanceOf(Error);
  });

  it('constructs with statusCode, message, and code', () => {
    const err = new AppError(404, 'not found', 'NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('not found');
    expect(err.code).toBe('NOT_FOUND');
  });

  it('defaults code to APP_ERROR', () => {
    const err = new AppError(500, 'something broke');
    expect(err.code).toBe('APP_ERROR');
  });
});
