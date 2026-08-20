/** Show Back to Top once the page is about this many viewports tall. */
export const LONG_PAGE_VIEWPORTS = 1.75

export function isLongPage(scrollHeight: number, viewportHeight: number): boolean {
  return viewportHeight > 0 && scrollHeight > viewportHeight * LONG_PAGE_VIEWPORTS
}
