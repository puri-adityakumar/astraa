interface PasswordOptions {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

interface PasswordResult {
  success: boolean
  password?: string
  error?: string
}

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