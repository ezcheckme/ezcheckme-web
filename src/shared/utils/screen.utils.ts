/**
 * Screen/fullscreen utility functions.
 * Port of screenService.js.
 */

/** Exit fullscreen (cross-browser) */
export function exitFullScreen(): void {
  const doc = document as Document & {
    mozCancelFullScreen?: () => void;
    webkitExitFullscreen?: () => void;
    msExitFullscreen?: () => void;
  };

  if (doc.exitFullscreen) {
    doc.exitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    doc.mozCancelFullScreen();
  } else if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  } else if (doc.msExitFullscreen) {
    doc.msExitFullscreen();
  }
}

/** Toggle fullscreen (cross-browser) */
export function fullScreen(
  mode: boolean,
  setScreenMode?: (mode: boolean) => void,
): void {
  const elem = document.documentElement as HTMLElement & {
    mozRequestFullScreen?: () => void;
    webkitRequestFullScreen?: () => void;
    msRequestFullscreen?: () => void;
  };

  if (!mode) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setScreenMode?.(true);
  } else {
    exitFullScreen();
    setScreenMode?.(false);
  }
}
