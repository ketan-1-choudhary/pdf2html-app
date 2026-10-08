export function useTheme() {
  const isDark = useState('theme-dark', () => false)

  // The <html> class is set by the inline head script; mirror it into state after mount.
  function sync() {
    isDark.value = document.documentElement.classList.contains('dark')
  }

  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('reflow-theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, sync, toggle }
}
