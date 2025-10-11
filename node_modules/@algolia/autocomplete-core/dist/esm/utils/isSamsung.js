var regex = /((gt|sm)-|galaxy nexus)|samsung[- ]|samsungbrowser/i;
export function isSamsung(userAgent) {
  return Boolean(userAgent && userAgent.match(regex));
}