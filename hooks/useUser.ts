/**
 * useUser Hook
 * 
 * Re-exports the useUser and useCurrentUser hooks from the UserProvider.
 * This allows components to import from a dedicated hooks directory.
 * 
 * Usage:
 * ```
 * import { useUser } from "@/hooks/useUser";
 * // or
 * import { useCurrentUser } from "@/hooks/useUser";
 * 
 * function MyComponent() {
 *   const { user, profile, isLoading, isAuthenticated, error } = useUser();
 *   
 *   if (isLoading) return <LoadingSkeleton />;
 *   if (!isAuthenticated) return <LoginPrompt />;
 *   return <UserContent user={user} profile={profile} />;
 * }
 * ```
 */

export { useUser, useCurrentUser } from "@/components/auth/UserProvider";
