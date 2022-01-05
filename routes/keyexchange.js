var express = require("express");
var router = express.Router();
const { KeyEncapsulation, Signature } = require("liboqs-node");
const axios = require("axios");

/* POST send key encapsulation param with certificate. */
router.post("/", async (req, res) => {
  const { accessToken } = req.body;
  const KEMAlgorithm = new KeyEncapsulation("Kyber512");
  const signatureAlgorithm = new Signature("Dilithium2");

  const signaturePublicKey = signatureAlgorithm.generateKeypair();
  const publicKey = KEMAlgorithm.generateKeypair();

  const signature = signatureAlgorithm.sign(publicKey);

  try {
    let response = await axios.post(
      "http://localhost:3000/api/keyexchange",
      {
        signature: JSON.stringify(signature),
        signaturePublicKey: JSON.stringify(signaturePublicKey),
        publicKey: JSON.stringify(publicKey),
      },
      {
        headers: {
          authorization: accessToken,
        },
      }
    );

    let { ciphertext, sharedSecret } = response.data;

    ciphertext = Buffer.from(JSON.parse(ciphertext).data);
    sharedSecret = Buffer.from(JSON.parse(sharedSecret).data);

    const secret = KEMAlgorithm.decapsulateSecret(ciphertext);

    if (Buffer.compare(secret, sharedSecret) === 0) {
      console.log("same secret");
      res.status(200).send(JSON.stringify(secret));
    } else {
      console.log("not same");
      res.status(501).send({ status: false });
    }

    // if (response.status === 200) {
    //   res.status(200).send(JSON.stringify(sharedSecret));
    // } else {
    //   res.status(501).send({ status: false });
    // }
  } catch (error) {
    res.status(501).send({ status: false });
    console.log(error.message);
  }
});

module.exports = router;
