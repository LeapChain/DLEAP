package dtnb

import (
	"testing"
)

type DemoKey struct {
	PrivateHex, PublicHex string
	SignatureMocks        [][2]string
}

func DemoKeys() []DemoKey {
	return []DemoKey{
		{
			PrivateHex:     "80811257e5bc79976cba8fd689efe737947caf4e2a741ca11edb601ae3ab654d",
			PublicHex:      "4c41c0f516401d8ac975eae151bd6fda312cc81e5ce412f041373996a48cf762",
			SignatureMocks: [][2]string{{"HELLO, WORLD!", "5e9544bef0046166f15353a0298f41fc7791f1d66203cea659422b6e1a7f12737cffcb5fd71dac1d8f631703a09e9fd03210a6748af5e61cf1c1c3453060760b"}}},
		{
			PrivateHex: "5a9299a36b91c82918fa5b3d4ea5144cc588c20e66aadb44812d4f2eac953a76",
			PublicHex:  "4299a3508b6207a560143a87dbefc9273e13487f49fc79b31e22a02330947141",
			SignatureMocks: [][2]string{{"HELLO, WORLD!",
				"307d9fa244cf0a38bba092588a90dcd03cee190214fdc2362c3d0c14b8d768b36fc36716915747642f6144b0171fe95c56034dd203e7191bc4b2012dbbbefe02"},
			}},
		{
			PrivateHex: "09645e081d7d9e3bc01ec94081cf4048244ecf4dc8098b4b0a8275cee07003aa",
			PublicHex:  "1c25ff99a7fded3d632146616fd58c3a32b4cc683e04cfc53d8bbc5e59ef38ce",
			SignatureMocks: [][2]string{{
				"HELLO, WORLD!",
				"b355dd1fd6b1ba6cd529c10a6a6a732ca6eb8417d12fbf29344cdc5425dc4cc1a24efc9db04f9530a18150be0ba9d5844e4da0be87e6e19d224b9670da13d007"}}},
	}
}

func TestCreatingWalletsFromKeys(t *testing.T) {
	for _, data := range DemoKeys() {
		wallet, err := WalletFromHexKeys(data.PublicHex, data.PrivateHex)
		if err != nil {
			t.Log(err)
			t.Fail()
		}
		if wallet.PublicKeyHex() != data.PublicHex {
			t.Log("Expected the public hex keys to be equal.")
			t.Fail()
		}
		if privHex := wallet.PrivateKeyHex(); privHex != data.PrivateHex {
			t.Log("Expected the public hex keys to be equal.")
			t.Fail()
		}
	}
}

func TestCreatingWalletsFromSecret(t *testing.T) {
	for _, data := range DemoKeys() {
		wallet, err := WalletFromPrivateHex(data.PrivateHex)
		if err != nil {
			t.Log(err)
			t.Fail()
		}
		if wallet.PublicKeyHex() != data.PublicHex {
			t.Log("Expected the public hex keys to be equal.")
			t.Fail()
		}
		if privHex := wallet.PrivateKeyHex(); privHex != data.PrivateHex {
			t.Log("Expected the public hex keys to be equal.")
			t.Fail()
		}
	}
}

func TestCreatingSignatures(t *testing.T) {
	for _, data := range DemoKeys() {
		wallet, err := WalletFromPrivateHex(data.PrivateHex)
		if err != nil {
			t.Log(err)
			t.Fail()
		}
		for _, mockData := range data.SignatureMocks {
			msg := mockData[0]
			expectedSig := mockData[1]
			sig := wallet.Sign([]byte(msg))

			if sig.Hex() != expectedSig {
				t.Log("Expected the signatures to match.")
				t.Fail()
			}
		}
	}
}

func TestVerifyingSignatures(t *testing.T) {
	data := DemoKeys()[0]
	wallet, err := WalletFromPrivateHex(data.PrivateHex)

	if err != nil {
		t.Log("Create wallet failed: ", err)
		t.Fail()
	}

	msg := []byte{2, 3, 4, 5}
	sig := wallet.Sign(msg)

	if sig.Verify(wallet.PublicKey(), msg) != true {
		t.Log("Expected signature to match public key.")
		t.Fail()
	}

	if sig.Verify(wallet.PublicKey(), []byte{2, 4, 4, 5}) != false {
		t.Log("Expected the signature to be invalid.")
		t.Fail()
	}
}

func TestGenerateWallet(t *testing.T) {
	wallet, err := GenerateWallet(nil)
	if err != nil {
		t.Log(err)
		t.Fail()
	}
	sig := wallet.Sign([]byte{2, 4, 5})
	if sig.Verify(wallet.PublicKey(), []byte{2, 4, 5}) != true {
		t.Log("Expected the signature to be associated with the wallet.")
		t.Fail()
	}
}
