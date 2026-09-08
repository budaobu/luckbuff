import type { DeviceCapability } from '~/types/fengshui-luopan'

interface PermissionCapableEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function detectDeviceCapability(): DeviceCapability {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobileLike: false,
      supportsOrientation: false,
      supportsMotion: false,
      supportsAbsoluteOrientation: false,
      requiresPermission: false,
      canUseCompass: false,
    }
  }

  const orientationEvent = window.DeviceOrientationEvent
  const motionEvent = window.DeviceMotionEvent
  const userAgent = navigator.userAgent
  const isTouch = navigator.maxTouchPoints > 1
  const isSmallCoarseScreen = window.matchMedia('(pointer: coarse)').matches
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(userAgent)
  const isIpadOsDesktopUa = /Macintosh/.test(userAgent) && isTouch
  const isMobileLike = isMobileUa || isIpadOsDesktopUa || isSmallCoarseScreen
  const supportsOrientation = Boolean(orientationEvent)
  const supportsAbsoluteOrientation = supportsOrientation && 'ondeviceorientationabsolute' in window
  const requiresPermission = supportsOrientation
    && Boolean((orientationEvent as unknown as PermissionCapableEvent).requestPermission)

  return {
    isMobileLike,
    supportsOrientation,
    supportsMotion: Boolean(motionEvent),
    supportsAbsoluteOrientation,
    requiresPermission,
    // API existence alone is not enough. The runtime still requires a valid absolute sample.
    canUseCompass: isMobileLike && supportsOrientation && (requiresPermission || supportsAbsoluteOrientation),
  }
}
