// Provides a safe function to open links in a new tab/window
// that aren't vulnerable to reverse tabnabbing https://owasp.org/www-community/attacks/Reverse_Tabnabbing
export const safeBlankLinkOpen = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
