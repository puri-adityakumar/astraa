export interface ThemeVariables {
  [key: string]: string
}

export interface Theme {
  name: string
  variables: ThemeVariables
}

export interface ThemeConfig {
  light: Theme
  dark: Theme
}