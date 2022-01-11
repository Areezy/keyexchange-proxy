var express = require("express");
var router = express.Router();
const { KeyEncapsulation, Signature } = require("liboqs-node");
const axios = require("axios");

/* POST send key encapsulation param with certificate. */
router.post("/", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) return res.status(400).send("No Access Token");
  
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

    let { ciphertext } = response.data;

    ciphertext = Buffer.from(JSON.parse(ciphertext).data);

    const secret = KEMAlgorithm.decapsulateSecret(ciphertext);

    res.status(200).send(JSON.stringify(secret));

  } catch (error) {
    res.status(401).send({ status: false });
    console.log(error.message);
  }
});

module.exports = router;
