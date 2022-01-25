var express = require("express");
var router = express.Router();
const { KeyEncapsulation, Signature } = require("liboqs-node");
const axios = require("axios");
const { performance } = require("perf_hooks");

/* POST send key encapsulation param with certificate. */
router.post("/", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) return res.status(400).send("No Access Token");

  const KEMAlgorithm = new KeyEncapsulation("Kyber512");
  const signatureAlgorithm = new Signature("Dilithium2");
  const signaturePublicKey = signatureAlgorithm.generateKeypair();

  const publicKey = KEMAlgorithm.generateKeypair();

  let startTime = performance.now();

  const signature = signatureAlgorithm.sign(publicKey);

  let endTime = performance.now();

  let elapsed = endTime - startTime;

  console.log("\n");
  console.log("\n");
  console.log("\n");
  console.log("-----------------------------------------------------------");

  console.log(
    `CLIENT:PROXY: Digital Signature size is ${Buffer.byteLength(
      signature
    )} bytes`
  );

  console.log(
    `CLIENT:PROXY Digital Signature generation took ${elapsed.toFixed(
      2
    )} milliseconds`
  );

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

    startTime = performance.now();
    const secret = KEMAlgorithm.decapsulateSecret(ciphertext);
    endTime = performance.now();
    elapsed = endTime - startTime;
    console.log(
      `CLIENT:PROXY Secret Key Decapsulation by proxy took ${elapsed.toFixed(
        2
      )} milliseconds`
    );

    console.log("-----------------------------------------------------------");
    console.log("\n");
    console.log("\n");
    console.log("\n");

    res.status(200).send(JSON.stringify(secret));
  } catch (error) {
    res.status(401).send({ status: false });
    console.log(error.message);
  }
});

module.exports = router;
