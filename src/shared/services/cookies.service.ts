/**
 * Cookies Service
 * Handles the cookie consent banner visibility.
 */

export const hideCookiesConcentWindow = (): void => {
  try {
    const cookies = document.querySelector(
      ".wpcc-container",
    ) as HTMLElement | null;
    if (cookies) {
      cookies.style.display = "none";
    }
  } catch (error) {
    console.error("Failed to hide cookies consent window:", error);
  }
};
