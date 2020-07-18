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
    description: 'hexa representation of 32-byte long seed',
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
var data = `type: Node operator signing key
title: Stake pool operator key
cbor-hex:
 5820${coldKeyPair.privateKey.toString('hex').slice(0,64)}
`

fs.writeFile(`${prefix}.skey`, data, (err) => {
  if (err) throw err;
})

console.log(`Writing cold verifying key to "${prefix}.vkey file."`)
data = `type: Node operator verification key
title: Stake pool operator key
cbor-hex:
 5820${coldKeyPair.publicKey.toString('hex')}
`
fs.writeFile(`${prefix}.vkey`, data, (err) => {
  if (err) throw err;
})


console.log(`Writing cold counter to "${prefix}.counter" file.`)
data = `type: Node operational certificate issue counter
title: Next certificate issue number: 0
cbor-hex:
 00
 `
fs.writeFile(`${prefix}.counter`, data, (err) => {
  if (err) throw err;
})

// Pool Id
let context = blake.createHash({
  digestLength: 28
})

context.update(coldKeyPair.publicKey)
data = context.digest().toString('hex')
console.log(`Writing cold pool id to "${prefix}.id" file.`)
fs.writeFile(`${prefix}.id`, data, (err) => {
  if (err) throw err;
})

