export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Auth utilities - no longer needed with simple password auth
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  // This function is deprecated - use the new auth system instead
}
