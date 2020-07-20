# Pool Offline Tools

# Componennts
- `poolid`: generating random `ED25519` keypairs contains the first few bytes of the poolid set as paramaters.
    - e.d. `$ ./poolid "decaf0" `
    - means 256^k operations where k=number of bytes.
- `cold-js`: generating, recovering cold-keys based on a 24-word (256bit entropy) length mnemonics.
    - e.g. `$ node cold-js -h # for help`
- the relevant `genesis` file
- the relevant `cardano-addresses` binaries.

# Use cases

There are two main group of use cases:
- node and 
- key related. 

The following use-cases will be discussed further:
- Generating cold-key's mnemonic
- Recovering cold-key keypairs from mnemonics
- Generating VRF keys mnemonic (not implemented yet)
- Recovering VRF kesy from mnemonic.
- Bootstrapping a node 
    - pool operator(s) is/are the owner(s)
    - pool operator(s) is/are **NOT** not the owner(s)
- KES keys rotating.

# Installation

First the prerequisities should be installed online after the OS (on encrypted storage, booting is pssword protected) is installed.

When it's done the device can be air-gapped i.e. offline of the Internet (no wi-fi enabled, no any connection to any network). Therefore, only console access meaning keyboard and display and USB stick access for transferring keys, certificates and transactions.

## Donwload binaries