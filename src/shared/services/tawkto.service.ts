/**
 * Tawk.to Service
 * Integrates with the global window.Tawk_API object injected by the Tawk.to script.
 */

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget: () => void;
      showWidget: () => void;
      maximize: () => void;
      addTags: (tags: any, callback?: (error: any) => void) => void;
      isChatMinimized: () => boolean;
    };
  }
}

export const hideTawkWidget = (): void => {
  try {
    if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
      window.Tawk_API.hideWidget();
    } else {
      console.warn("Tawk_API.hideWidget is not available");
    }
  } catch (error) {
    console.error("Error hiding Tawk widget:", error);
  }
};

export const showTawkWidget = (): void => {
  try {
    if (window.Tawk_API && typeof window.Tawk_API.showWidget === "function") {
      window.Tawk_API.showWidget();
    } else {
      console.warn("Tawk_API.showWidget is not available");
    }
  } catch (error) {
    console.error("Error showing Tawk widget:", error);
  }
};

export const maximizeTawkWidget = (): void => {
  try {
    if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
      window.Tawk_API.maximize();
    } else {
      console.warn("Tawk_API.maximize is not available");
    }
  } catch (error) {
    console.error("Error maximizing Tawk widget:", error);
  }
};

export const tawktoAddTags = (tags: any): void => {
  try {
    if (window.Tawk_API && typeof window.Tawk_API.addTags === "function") {
      window.Tawk_API.addTags(tags, (error: any) => {
        if (error) {
          console.error("Error adding Tawk tags:", error);
        }
      });
    } else {
      console.warn("Tawk_API.addTags is not available");
    }
  } catch (error) {
    console.error("Error adding Tawk tags:", error);
  }
};

export const isTawktoMinimized = (): boolean => {
  try {
    if (
      window.Tawk_API &&
      typeof window.Tawk_API.isChatMinimized === "function"
    ) {
      return window.Tawk_API.isChatMinimized();
    } else {
      console.warn("Tawk_API.isChatMinimized is not available");
      return false;
    }
  } catch (error) {
    console.error("Error checking if Tawk is minimized:", error);
    return false;
  }
};

export const isTawktoLoaded = (): boolean => {
  try {
    return !!window.Tawk_API && typeof window.Tawk_API === "object";
  } catch (error) {
    console.error("Error checking if Tawk is loaded:", error);
    return false;
  }
};
