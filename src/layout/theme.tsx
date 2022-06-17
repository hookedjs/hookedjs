export class Theme {
  primaryH = 0
  primaryS = 0
  primaryL = 30
  primaryHoverLDelta = 10
  primary = ''
  primaryHover = ''
  secondaryH = 0
  secondaryS = 0
  secondaryL = 40
  secondaryHoverLDelta = 4
  secondary = ''
  secondaryHover = ''
  successH = 130
  successS = 50
  successL = 40
  successHoverLDelta = 4
  success = ''
  successHover = ''
  warningH = 45
  warningS = 100
  warningL = 40
  warningHoverLDelta = 4
  warning = ''
  warningHover = ''
  dangerH = 0
  dangerS = 100
  dangerL = 40
  dangerHoverLDelta = 10
  danger = ''
  dangerHover = ''

  constructor(vals: Partial<Theme>) {
    Object.assign(this, vals)
    this.primary = `hsl(${this.primaryH},${this.primaryS}%,${this.primaryL}%)`
    this.primaryHover = `hsl(${this.primaryH},${this.primaryS}%,${this.primaryL + this.primaryHoverLDelta}%)`
    this.secondary = `hsl(${this.secondaryH},${this.secondaryS}%,${this.secondaryL}%)`
    this.secondaryHover = `hsl(${this.secondaryH},${this.secondaryS}%,${this.secondaryL + this.secondaryHoverLDelta}%)`
    this.success = `hsl(${this.successH},${this.successS}%,${this.successL}%)`
    this.successHover = `hsl(${this.successH},${this.successS}%,${this.successL + this.successHoverLDelta}%)`
    this.warning = `hsl(${this.warningH},${this.warningS}%,${this.warningL}%)`
    this.warningHover = `hsl(${this.warningH},${this.warningS}%,${this.warningL + this.warningHoverLDelta}%)`
    this.danger = `hsl(${this.dangerH},${this.dangerS}%,${this.dangerL}%)`
    this.dangerHover = `hsl(${this.dangerH},${this.dangerS}%,${this.dangerL + this.dangerHoverLDelta}%)`
  }
}

export const loadingTheme = new Theme({})
export const defaultTheme = new Theme({
  primaryH: 270,
  primaryS: 80,
  primaryL: 33,
  secondaryH: 45,
  secondaryS: 100,
  secondaryL: 40,
})
export const tenantDemoTheme = new Theme({
  primaryH: 160,
  primaryS: 100,
  primaryL: 15,
  secondaryH: 63,
  secondaryS: 25,
  secondaryL: 43,
})

export let currentTheme = loadingTheme
export function applyTheme(theme: Theme = loadingTheme) {
  const t = theme
  const s = setCssVariable
  s('--primary-h', t.primaryH)
  s('--primary-s', t.primaryS + '%')
  s('--primary-l', t.primaryL + '%')
  s('--primary', t.primary)
  s('--primary-hover', t.primaryHover)
  s('--secondary-h', t.secondaryH)
  s('--secondary-s', t.secondaryS + '%')
  s('--secondary-l', t.secondaryL + '%')
  s('--secondary', t.secondary)
  s('--secondary-hover', t.secondaryHover)
  s('--success-h', t.successH)
  s('--success-s', t.successS + '%')
  s('--success-l', t.successL + '%')
  s('--success', t.success)
  s('--success-hover', t.successHover)
  s('--warning-h', t.warningH)
  s('--warning-s', t.warningS + '%')
  s('--warning-l', t.warningL + '%')
  s('--warning', t.warning)
  s('--warning-hover', t.warningHover)
  s('--danger-h', t.dangerH)
  s('--danger-s', t.dangerS + '%')
  s('--danger-l', t.dangerL + '%')
  s('--danger', t.danger)
  s('--danger-hover', t.dangerHover)
  currentTheme = t
}

export function getCssVariable(key: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(key) || ''
}
export function setCssVariable(key: string, val: number | string) {
  document.documentElement.style.setProperty(key, `${val}`)
}

export function addCss(css: string) {
  const link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.innerHTML = css
  document.head.appendChild(link)
}
