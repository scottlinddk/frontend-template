import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

/**
 * Thin indeterminate bar shown while a navigation's loader or a submission is
 * in flight. Delayed by 100ms so navigations that resolve from cache do not
 * flash it for a single frame.
 */
export function RouteProgress() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(isNavigating), isNavigating ? 100 : 0);
    return () => clearTimeout(id);
  }, [isNavigating]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden motion-reduce:hidden"
    >
      <div className="animate-route-progress h-full w-1/3 rounded-full bg-brand-500" />
    </div>
  );
}
