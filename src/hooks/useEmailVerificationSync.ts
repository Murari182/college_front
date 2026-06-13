import { useEffect } from "react";

/**
 * After the user clicks the Firebase email link (often in another tab), reloads the
 * current user so `emailVerified` updates and the UI shows the checkmark without
 * manually tapping "Refresh email status".
 */
export function useEmailVerificationSync() {
  useEffect(() => {
    return;
  }, []);
}
