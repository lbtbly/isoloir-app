// Le décodeur JavaScript des QR codes (bibliothèque qr, sans réseau ni WebAssembly), chargé à part et seulement là où
// le navigateur n'a pas le sien (BarcodeDetector : absent de Safari sur iPhone et de Firefox).
export { decodeQR } from 'qr/decode.js'
