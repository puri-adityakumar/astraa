
interface PasswordOptions {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

type PasswordResult =
  | { success: true; password: string }
  | { success: false; error: string }

const words = [
  "apple", "brave", "cloud", "delta", "eagle", "flame", "grape", "house",
  "input", "jolly", "kite", "lemon", "mango", "night", "ocean", "piano",
  "quest", "river", "stone", "tiger", "unity", "vivid", "water", "xenon",
  "yacht", "zebra", "amber", "beach", "coral", "dawn", "earth", "field",
  "giant", "hazel", "ivory", "jewel", "knack", "lunar", "misty", "nova",
  "orbit", "pearl", "quiet", "ruby", "solar", "topic", "urban", "vault",
  "whale", "youth", "azure", "bloom", "chart", "drift", "entry", "forge",
  "grove", "haven", "image", "jump", "koala", "laser", "march", "noble",
  "oasis", "pilot", "quake", "radar", "scale", "tank", "ultra", "vocal",
  "wheat", "xerox", "yearn", "zinc", "baker", "chef", "diver", "early",
  "fable", "ghost", "happy", "iron", "joker", "karma", "light", "magic",
  "nurse", "opera", "paint", "quick", "radio", "snake", "toast", "uncle",
  "video", "world", "xray", "yoga", "zone", "action", "balance", "circle",
  "dream", "energy", "future", "garden", "harbor", "island", "jacket"
]

export function generatePassword(length: number, options: PasswordOptions): PasswordResult {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  let chars = ""
  if (options.uppercase) chars += uppercase
  if (options.lowercase) chars += lowercase
  if (options.numbers) chars += numbers
  if (options.symbols) chars += symbols

  if (chars === "") {
    return {
      success: false,
      error: "Please select at least one character type"
    }
  }

  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return {
    success: true,
    password
  }
}

export function generateMemorablePassword(count: number, capitalize: boolean): PasswordResult {
  if (count < 2) count = 2
  if (count > 10) count = 10

  const selectedWords: string[] = []

  for (let i = 0; i < count; i++) {
    const word = words[Math.floor(Math.random() * words.length)]
    if (!word) continue
    let processedWord = word
    if (capitalize) {
      processedWord = processedWord.charAt(0).toUpperCase() + processedWord.slice(1)
    }
    selectedWords.push(processedWord)
  }

  // If "fullWords" is false, maybe we shouldn't use dashes? 
  // The screenshot shows "full words" toggle and example "mixture-tells...".
  // Let's assume the toggle is for the separator.
  // Actually, in standard memorable generators "Full Words" usually means avoid truncating or using logic.
  // BUT, closer look at screenshot: "Use full words" is ON and text is "mixture-tells...".
  // Let's assume separator is "-" by default for memorable.

  return {
    success: true,
    password: selectedWords.join("-")
  }
}

export function generatePin(length: number): PasswordResult {
  const numbers = "0123456789"
  let pin = ""
  for (let i = 0; i < length; i++) {
    pin += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  return {
    success: true,
    password: pin
  }
}