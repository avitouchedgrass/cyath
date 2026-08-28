import { describe, it, expect } from 'vitest';

export const isSafeRelativeUrl = (url: string | null): boolean => {
  if (!url) return false;
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
};

describe('Open Redirect Sanitizer (CWE-601)', () => {
  it('allows safe relative internal routes', () => {
    expect(isSafeRelativeUrl('/dashboard')).toBe(true);
    expect(isSafeRelativeUrl('/recipes?inspect=chicken-curry')).toBe(true);
    expect(isSafeRelativeUrl('/onboarding?edit=true')).toBe(true);
    expect(isSafeRelativeUrl('/profile')).toBe(true);
  });

  it('blocks absolute external URLs', () => {
    expect(isSafeRelativeUrl('https://evil.com')).toBe(false);
    expect(isSafeRelativeUrl('http://attacker.com/phishing')).toBe(false);
    expect(isSafeRelativeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeRelativeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('blocks protocol-relative URLs (//evil.com)', () => {
    expect(isSafeRelativeUrl('//evil.com')).toBe(false);
    expect(isSafeRelativeUrl('//google.com/malicious')).toBe(false);
  });

  it('blocks backslash bypass attempts (/\\evil.com)', () => {
    expect(isSafeRelativeUrl('/\\evil.com')).toBe(false);
    expect(isSafeRelativeUrl('/path\\to\\danger')).toBe(false);
  });

  it('safely handles empty or null input', () => {
    expect(isSafeRelativeUrl(null)).toBe(false);
    expect(isSafeRelativeUrl('')).toBe(false);
  });
});
