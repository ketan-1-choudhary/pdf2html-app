// Shared, SSR-friendly current-username state.
export const useCurrentUser = () => useState<string | null>('currentUser', () => null)
