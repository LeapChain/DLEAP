from typing import Annotated, Sequence
from dtnb import Wallet


class DemoKeys:
    private_hex: str
    public_hex: str
    signature_mocks: Annotated[Sequence[bytes], 2]  # list of 2 items containing message and signature

    def __init__(self, priv: str, pub: str, signature: Annotated[Sequence[bytes], 2]):
        self.private_hex = priv
        self.public_hex = pub
        self.signature_mocks = signature


def demo_keys():
    return (
        DemoKeys(
            "80811257e5bc79976cba8fd689efe737947caf4e2a741ca11edb601ae3ab654d",
            "4c41c0f516401d8ac975eae151bd6fda312cc81e5ce412f041373996a48cf762",
            ["HELLO, WORLD!", "5e9544bef0046166f15353a0298f41fc7791f1d66203cea659422b6e1a7f12737cffcb5fd71dac1d8f631703a09e9fd03210a6748af5e61cf1c1c3453060760b"]
        ),
        DemoKeys("5a9299a36b91c82918fa5b3d4ea5144cc588c20e66aadb44812d4f2eac953a76", "4299a3508b6207a560143a87dbefc9273e13487f49fc79b31e22a02330947141", ["HELLO, WORLD!",
				"307d9fa244cf0a38bba092588a90dcd03cee190214fdc2362c3d0c14b8d768b36fc36716915747642f6144b0171fe95c56034dd203e7191bc4b2012dbbbefe02"]
        ),
        DemoKeys("09645e081d7d9e3bc01ec94081cf4048244ecf4dc8098b4b0a8275cee07003aa", "1c25ff99a7fded3d632146616fd58c3a32b4cc683e04cfc53d8bbc5e59ef38ce",
                ["HELLO, WORLD!", "b355dd1fd6b1ba6cd529c10a6a6a732ca6eb8417d12fbf29344cdc5425dc4cc1a24efc9db04f9530a18150be0ba9d5844e4da0be87e6e19d224b9670da13d007"]
        )
    )


def test_creating_wallets_from_keys():
    for dk in demo_keys():
        wallet = Wallet.from_hex(dk.public_hex, dk.private_hex)


if __name__ == "__main__":

    test_creating_wallets_from_keys()
