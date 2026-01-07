import niceware from 'niceware';

interface PasswordOptions {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
}

type PasswordResult =
    | { success: true; password: string }
    | { success: false; error: string }

const CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
}

function getSecureRandomInt(max: number): number {
    if (max <= 0) throw new Error("Max must be positive");
    if (max === 1) return 0;
    
    const array = new Uint32Array(1);
    let randomValue;
    const limit = Math.floor(0x100000000 / max) * max;

    do {
        crypto.getRandomValues(array);
        randomValue = array[0];
    } while (randomValue >= limit);

    return randomValue % max;
}

function secureShuffle(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function generatePassword(length: number, options: PasswordOptions): PasswordResult {
    let allowedChars = "";
    const guaranteedChars: string[] = [];

    if (options.uppercase) {
        allowedChars += CHAR_SETS.uppercase;
        guaranteedChars.push(CHAR_SETS.uppercase[getSecureRandomInt(CHAR_SETS.uppercase.length)]!);
    }
    if (options.lowercase) {
        allowedChars += CHAR_SETS.lowercase;
        guaranteedChars.push(CHAR_SETS.lowercase[getSecureRandomInt(CHAR_SETS.lowercase.length)]!);
    }
    if (options.numbers) {
        allowedChars += CHAR_SETS.numbers;
        guaranteedChars.push(CHAR_SETS.numbers[getSecureRandomInt(CHAR_SETS.numbers.length)]!);
    }
    if (options.symbols) {
        allowedChars += CHAR_SETS.symbols;
        guaranteedChars.push(CHAR_SETS.symbols[getSecureRandomInt(CHAR_SETS.symbols.length)]!);
    }

    if (allowedChars.length === 0) {
        return { success: false, error: "Please select at least one character type" };
    }

    if (length < guaranteedChars.length) {
        return { 
            success: false, 
            error: `Password length ${length} is too short for ${guaranteedChars.length} required character types.` 
        };
    }

    let passwordArray = [...guaranteedChars];
    while (passwordArray.length < length) {
        const idx = getSecureRandomInt(allowedChars.length);
        passwordArray.push(allowedChars[idx]!);
    }

    passwordArray = secureShuffle(passwordArray);

    return {
        success: true,
        password: passwordArray.join(""),
    };
}

export function generateMemorablePassword(count: number, capitalize: boolean): PasswordResult {
    const safeCount = Math.max(2, Math.min(count, 10));

    try {
        const bytes = crypto.getRandomValues(new Uint8Array(safeCount * 2));
        const words = niceware.bytesToPassphrase(bytes);

        const formattedWords = words.map(word => {
            return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
        })

        return {
            success: true,
            password: formattedWords.join("-")
        }
    } catch (error) {
        return {
            success: false,
            error: "Failed to generate memorable password"
        };
    }
}

export function generatePin(length: number): PasswordResult {
    const numbers = CHAR_SETS.numbers;
    let pin = "";
    for (let i = 0; i < length; i++) {
        const idx = getSecureRandomInt(numbers.length);
        pin += numbers[idx];
    }

    return {
        success: true,
        password: pin
    }
}
