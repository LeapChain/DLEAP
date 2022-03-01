package dtnb

import (
	"crypto/ed25519"
	"encoding/hex"
	"errors"
	"io"
)

// A wrapper struct for 64-byte signatures.
type Signature struct {
	bytes []byte
}

// The 64-byte slice for the contained signature.
func (sig *Signature) Bytes() []byte {
	return sig.bytes
}

// Gets the given signature encoded
func (sig *Signature) Hex() string {
	return hex.EncodeToString(sig.bytes)
}

// Creates a new signature with the given bytes.
func NewSignature(bytes []byte) (*Signature, error) {
	if len(bytes) != 64 {
		return nil, errors.New("Expected the length of the signature's bytes to be 64.")
	}
	return &Signature{bytes}, nil
}

// Verifies if the current signature was created using a secret key associated
// with the given public key and message bytes.
func (sig *Signature) Verify(publicKey []byte, message []byte) bool {
	return ed25519.Verify(publicKey, message, sig.bytes)
}

// A helper struct for managing wallets which contains convenience methods for
// signing data and deriving the public key from the secret key.
type Wallet struct {
	publicKey, privateKey []byte
}

// Creates a wallet from the 32 byte long public and private keys.
func WalletFromByteKeys(pub []byte, priv []byte) (*Wallet, error) {
	if len(pub) != 32 {
		return nil, errors.New("Expected the public key to be 32 bytes long.")
	}
	if len(priv) != 32 {
		return nil, errors.New("Expected the private key to be 32 bytes long.")
	}
	return &Wallet{pub, priv}, nil
}

// Creates a wallet from the 32 byte long public and private keys encoded
// in hex strings.
func WalletFromHexKeys(pub string, priv string) (*Wallet, error) {
	pubBytes, err := hex.DecodeString(pub)
	if err != nil {
		return nil, err
	}
	privBytes, err := hex.DecodeString(priv)
	if err != nil {
		return nil, err
	}
	return &Wallet{pubBytes, privBytes}, nil
}

// Creates a wallet from the 32 byte long private key.
func WalletFromPrivate(priv []byte) (*Wallet, error) {
	if len(priv) != 32 {
		return nil, errors.New("Expected the private key to be 32 bytes long.")
	}
	key := ed25519.NewKeyFromSeed(priv)
	return &Wallet{key[32:], key[:32]}, nil
}

// Creates a wallet from the 32 byte long private key as a hex string.
func WalletFromPrivateHex(priv string) (*Wallet, error) {
	privBytes, err := hex.DecodeString(priv)
	if err != nil {
		return nil, err
	}
	return WalletFromPrivate(privBytes)
}

// Generates a wallet with a random private key and its associated public key.
func GenerateWallet(rand io.Reader) (*Wallet, error) {
	publicKey, privateKey, err := ed25519.GenerateKey(rand)
	if err != nil {
		return nil, err
	}
	return &Wallet{publicKey, privateKey[:32]}, nil
}

// Gets the 32-byte public key.
func (wallet *Wallet) PublicKey() []byte {
	return wallet.publicKey
}

// Gets the 32-byte private key.
func (wallet *Wallet) PrivateKey() []byte {
	return wallet.privateKey[:32]
}

// The 32-byte public key encoded in a hex string.
func (wallet *Wallet) PublicKeyHex() string {
	return hex.EncodeToString(wallet.publicKey)
}

// The 32-byte private key encoded in a hex string.
func (wallet *Wallet) PrivateKeyHex() string {
	return hex.EncodeToString(wallet.privateKey)
}

// Signs the given message and returns the signature.
func (wallet *Wallet) Sign(message []byte) Signature {
	fullPriv := append(wallet.privateKey[:], wallet.publicKey...)

	return Signature{ed25519.Sign(fullPriv, message)}
}
