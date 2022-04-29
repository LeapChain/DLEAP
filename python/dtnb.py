from typing import Sequence

from dataclasses import dataclass
from nacl.encoding import HexEncoder
from nacl.signing import SigningKey, VerifyKey


@dataclass
class Signature(bytes):
    data: Sequence[bytes]

    def bytes(self):
        """ 64-byte sequence signature """
        return self.data

    def hex(self):
        """ Returns the signature as a hex string """
        return HexEncoder.encode(self.bytes())
    
    @classmethod
    def new(cls, _bytes):
        """ Creates a new signature with the given bytes (length 64) """
        if len(_bytes) != 64:
            raise Exception(f"Expected length of bytes to be 64 but got {len(_bytes)}")
        
        cls.data = _bytes
        return cls()

    def verify(self, public_key: Sequence[bytes], message: Sequence[bytes]) -> bool:
        vk = VerifyKey(public_key)
        return vk.verify(message, self.bytes())


@dataclass
class Wallet:
    public_key: Sequence[bytes]
    private_key: Sequence[bytes]

    @classmethod
    def from_bytes(cls, pub: Sequence[bytes], priv: Sequence[bytes]):
        if len(pub) != 32:
            raise Exception(f"Expected public key to be 32 bytes long not {len(pub)}")
        if len(priv) != 32:
            raise Exception(f"Expected private key to be 32 bytes long not {len(priv)}")
        cls.public_key = pub
        cls.private_key = priv
        return cls()

    @classmethod
    def from_hex(cls, pub: str, priv: str):
        try:
            pub_bytes = HexEncoder.decode(pub)
            priv_bytes = HexEncoder.decode(priv)
        except:
            raise
        cls.public_key = pub_bytes
        cls.private_key = priv_bytes
        return cls()

    @classmethod
    def from_private_bytes(cls, priv: Sequence[bytes]):
        if len(priv) != 32:
            raise Exception(f"Expected private key to be 32 bytes long not {len(priv)}")
        key = SigningKey(priv, encoder=HexEncoder)
        cls.public_key = key[32:]
        cls.private_key = key[:32]
        return cls()

    @classmethod
    def from_private_hex(cls, priv: str):
        try:
            priv_bytes = HexEncoder.decode(priv)
        except:
            raise
        return cls.from_private_bytes(priv_bytes)

    @classmethod
    def generate(cls):
        priv = SigningKey.generate()
        cls.public_key = cls.private_key.verify_key.encode(encoder=HexEncoder)
        cls.private_key = priv[:32]
        return cls()

    @property
    def private_key_hex(self):
        return HexEncoder(self.private_key)

    @property
    def public_key_hex(self):
        return HexEncoder(self.public_key)

    def sign(self, message: Sequence[bytes]) -> Signature:
        full_priv = self.private_key.append(self.public_key)
        return Signature(SigningKey(full_priv, encoder=HexEncoder), message)
