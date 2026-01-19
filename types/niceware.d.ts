declare module "niceware" {
  type Passphrase = string[];

  interface Niceware {
    bytesToPassphrase(bytes: Uint8Array): Passphrase;
    passphraseToBytes(passphrase: Passphrase): Uint8Array;
  }

  const niceware: Niceware;
  export default niceware;
}
