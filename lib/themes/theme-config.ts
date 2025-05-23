import { ThemeConfig } from "./types"

export const themes: ThemeConfig = {
  light: {
    name: "light",
    variables: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      "card-foreground": "240 10% 3.9%",
      popover: "0 0% 100%",
      "popover-foreground": "240 10% 3.9%",
      primary: "142 76% 36%",
      "primary-foreground": "355.7 100% 97.3%",
      secondary: "142 76% 36%",
      "secondary-foreground": "355.7 100% 97.3%",
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      accent: "142 76% 36%",
      "accent-foreground": "355.7 100% 97.3%",
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "142 76% 36%"
    }
  },
  dark: {
    name: "dark",
    variables: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      popover: "240 10% 3.9%",
      "popover-foreground": "0 0% 98%",
      primary: "252 100% 69%",
      "primary-foreground": "0 0% 98%",
      secondary: "217 100% 61%",
      "secondary-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      accent: "291 100% 69%",
      "accent-foreground": "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      "destructive-foreground": "0 0% 98%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "252 100% 69%"
    }
  }
}