const bip39 = require('bip39')
const blake = require('@anzerr/blake2b')
const ed25519 = require('ed25519')
const yargs = require('yargs')
const fs = require('fs')

function toByteArray(hexString) {
  var result = new Uint8Array(hexString.length / 2)
  for (var i = 0; i < hexString.length; i += 2) {
    result[i / 2] = parseInt(hexString.substring(i, i + 2), 16)
  }
  return result
}

/**
 * Main
 * ```
 * $ node ./doCold.js -o /tmp/UNDR 
 * No seed nor mnemonic presented, generating randomly...
 * 
 * Write down the following 24-length mnemonic for recovery
 * 24-word length mnemonic : assume diesel surround alarm matter age candy message chaos moral relief fortune because heart gorilla modify surface twelve answer process avoid private pipe spot
 * 
 * Writing cold signing key to "/tmp/UNDR.skey" file
 * Writing cold verifying key to "/tmp/UNDR.vkey file."
 * Writing cold counter to "/tmp/UNDR.counter" file.
 * Writing cold pool id to "/tmp/UNDR.id" file.
 * ```
 */
const argv = yargs
  .option('mnemonic', {
    alias: 'm',
    description: '24-word length mnemonic',
    type: 'array',
  })
  .option('seed', {
    alias: 's',
    description: 'hexa representation of a 32-byte long random seed',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    description: 'Output prefix of the files. e.g. -o /tmp/UNDR: default: cold',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .argv

var mnemonic = ''
var seed = ''
var prefix = 'cold'

if (argv.output !== undefined) {
  prefix = argv.output
}

if (argv.seed !== undefined) {
  seed = argv.seed
  try {
    mnemonic = bip39.entropyToMnemonic(seed)
  } catch (e) {
    console.log("Invalid entropy, it should be a hexa string of a 32b long entropy.")
    return -127
  }
} else if (argv.mnemonic) {
  if (argv.mnemonic.length === 24) {
    mnemonic = argv.mnemonic.join(" ")
    console.log(`MNE: ${mnemonic}`)
    seed = bip39.mnemonicToEntropy(mnemonic)
  } else {
    console.log("The mnemonic must be a 24-word length long, no apostrophes allowed.")
    return -127
  }

} else {
  console.log("No seed nor mnemonic presented, generating randomly...")
  mnemonic = bip39.generateMnemonic(256)
  seed = bip39.mnemonicToEntropy(mnemonic)
}

const coldKeyPair = ed25519.MakeKeypair(toByteArray(seed))

console.log(`Write down the following 24-length mnemonic for recovery`)
console.log(`24-word length mnemonic : ${mnemonic}\n`)


console.log(`Writing cold signing key to "${prefix}.skey" file`)

var json = {
  type: "",
  description: "",
  cborHex: ""
}

json.type = 'StakePoolSigningKey_ed25519'
json.description = 'Stake Pool Operator Signing Key'
json.cborHex = `5820${coldKeyPair.privateKey.toString('hex').slice(0,64)}`

fs.writeFile(`${prefix}.skey`, JSON.stringify(json, null, 4), 'utf8', (err) => {
  if (err) throw err;
})

console.log(`Writing cold verifying key to "${prefix}.vkey file."`)
json.type = 'StakePoolVerificationKey_ed25519'
json.description = 'Stake Pool Operator Verification Key'
json.cborHex = `5820${coldKeyPair.publicKey.toString('hex')}`

fs.writeFile(`${prefix}.vkey`, JSON.stringify(json, null, 4), 'utf8', (err) => {
  if (err) throw err;
})

console.log(`Writing cold counter to "${prefix}.counter" file.`)
json.type = 'NodeOperationalCertificateIssueCounter'
json.description = 'Next certificate issue number: 0'
json.cborHex = `82005820${coldKeyPair.publicKey.toString('hex')}`

fs.writeFile(`${prefix}.counter`, JSON.stringify(json, null, 4), 'utf8', (err) => {
  if (err) throw err;
})

// Pool Id, the blake2b_224 hash of the public key.
let context = blake.createHash({
  digestLength: 28
})

context.update(coldKeyPair.publicKey)
const data = context.digest().toString('hex')
console.log(`Writing cold pool id to "${prefix}.id" file.`)
fs.writeFile(`${prefix}.id`, data, (err) => {
  if (err) throw err;
})