use crate::Signature;
use ed25519_dalek::{Keypair, PublicKey, SecretKey, SignatureError, Signer};
use rand_core::{CryptoRng, RngCore};

/// A structure for holding the public and secret keys for use within the chain.
pub struct Wallet(Keypair);

impl Wallet {
    /// Constructs a new [`Wallet`].
    ///
    /// ## Notes
    /// - This may return an error if the lengths of the public key or secret
    ///   key are not `32`.
    #[inline]
    pub fn new(public: &[u8], secret: &[u8]) -> Result<Self, SignatureError> {
        Ok(Self(Keypair {
            public: PublicKey::from_bytes(public)?,
            secret: SecretKey::from_bytes(secret)?,
        }))
    }

    /// Constructs a new [`Wallet`] with the given secret key and derives the
    /// public key from the secret key using cryptography.
    ///
    /// ## Notes
    /// - This will return an error if the length of the secret key is not `32`.
    #[inline]
    pub fn from_secret(secret: &[u8]) -> Result<Self, SignatureError> {
        let secret = SecretKey::from_bytes(secret)?;
        Ok(Self(Keypair {
            public: PublicKey::from(&secret),
            secret,
        }))
    }

    /// Attempts to create a new [`Wallet`] by parsing the hexadecimal secret
    /// key and then deriving the public key.
    #[inline]
    pub fn from_hex_secret(secret: &str) -> Result<Self, SignatureError> {
        let secret = hex::decode(secret)
            .map_err(|_| SignatureError::from_source("Invalid hexadecimal source."))?;
        Self::from_secret(&secret)
    }

    /// Gets the public key bytes from the [`Wallet`].
    #[inline]
    pub fn public_key(&self) -> &[u8; 32] {
        self.0.public.as_bytes()
    }

    /// Gets the public key bytes as a hexadecimal [`String`].
    #[inline]
    pub fn public_hex_key(&self) -> String {
        hex::encode(self.public_key())
    }

    /// Gets the secret key bytes from the [`Wallet`].
    #[inline]
    pub fn secret_key(&self) -> &[u8; 32] {
        self.0.secret.as_bytes()
    }

    /// Gets the secret key bytes as a hexadecimal [`String`].
    #[inline]
    pub fn secret_hex_key(&self) -> String {
        hex::encode(self.secret_key())
    }

    /// Generates a [`Wallet`] with a random secret key along with its
    /// associated public key.
    ///
    /// ## Notes
    /// - This requires a version of `rand` compatible with version `0.5` to be
    ///   used for the random number generation traits to be satisfied due to
    ///   the `ed25519-dalek` dependency's version. See
    ///   https://github.com/dalek-cryptography/ed25519-dalek/issues/162
    #[inline]
    pub fn generate<Rng: CryptoRng + RngCore>(rng: &mut Rng) -> Self {
        Self(Keypair::generate(rng))
    }

    /// Signs the given message and returns the generated signature.
    #[inline]
    pub fn sign<Message: AsRef<[u8]>>(&self, msg: Message) -> Result<Signature, SignatureError> {
        let Self(pair) = self;
        Ok(Signature(pair.try_sign(msg.as_ref())?))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand_core::OsRng;

    #[test]
    fn hex_wallet_creation() {
        let hex_pairs = [
            (
                "80811257e5bc79976cba8fd689efe737947caf4e2a741ca11edb601ae3ab654d",
                "4c41c0f516401d8ac975eae151bd6fda312cc81e5ce412f041373996a48cf762",
            ),
            (
                "5a9299a36b91c82918fa5b3d4ea5144cc588c20e66aadb44812d4f2eac953a76",
                "4299a3508b6207a560143a87dbefc9273e13487f49fc79b31e22a02330947141",
            ),
            (
                "09645e081d7d9e3bc01ec94081cf4048244ecf4dc8098b4b0a8275cee07003aa",
                "1c25ff99a7fded3d632146616fd58c3a32b4cc683e04cfc53d8bbc5e59ef38ce",
            ),
        ];

        for (secret, public) in hex_pairs {
            let wallet = Wallet::from_hex_secret(secret).unwrap();
            assert_eq!(wallet.public_hex_key(), public);
        }
    }

    #[test]
    fn generate_wallet_passes() {
        let mut rng = OsRng {};
        Wallet::generate(&mut rng);
        Wallet::generate(&mut rng);
        Wallet::generate(&mut rng);
    }

    #[test]
    fn signing_data() {
        let message = "HELLO, WORLD!";
        let pairs = [(
            "705a3b36b44c2e95eebba870dc6fe5280c5c72783e2fe9449ebb73556faec57e",
            "bda5c7af7d0992837d73e3cafea46e4b0879cd5445d0909060a20d81aadbd730b0a24f8b503646dd601a30b8d4a67c15ad44d97f4228347c10713bb95fe3e309",
        ), (
					"aa1ec5983b73d4870721d51a8c6a8fd27982029c0c7fee40a5d25d72861a48a9",
					"836df0c9174558bfe39e0051cbe7310cca3c51f8d1e7ba36bef297d6d3a6e58c1079d753901316e49dbae3715191c2b0fc7713bbba6d590fec14fb0f9e8f110a"
				), (
					"0f6af6c4bd20f06cb0146b8344c75bceae3405497415d7261f615bcf48f633de",
					"fcb5092b7850d83e9d55123b198128b3df5e4181d4cfffb9ab3109ce7c134cbdb63ee2bd93b50a2417df1bb2178d2c37bbad18d02f68589a22ecfea90f1d3f04"
				)];

        for (secret, expected_sig) in pairs {
            let wallet = Wallet::from_hex_secret(secret).unwrap();
            let sig = wallet.sign(message).unwrap();
            assert_eq!(sig.as_hex(), expected_sig);
        }
    }
}
