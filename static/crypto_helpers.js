// Code goes here
var keySize = 256;
var ivSize = 128;
var iterations = 100;

function encrypt(msg, passphrase) {
  var salt = CryptoJS.lib.WordArray.random(128 / 8);

  var key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: keySize / 32,
    iterations: iterations,
  });

  var iv = CryptoJS.lib.WordArray.random(ivSize / 8);

  var encrypted = CryptoJS.AES.encrypt(msg, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
    hasher: CryptoJS.algo.SHA256,
  });

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
  return transitmessage;
}

function decrypt(transitmessage, passphrase) {
  var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
  var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
  var encrypted = transitmessage.substring(64);

  var key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: keySize / 32,
    iterations: iterations,
  });

  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
    hasher: CryptoJS.algo.SHA256,
  });

  try {
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.log("error converting to utf err=", err);
    return "{}";
  }
}

function save(obj, key, successCallback, failCallback) {
  console.log("save(obj=", obj);
  const string = JSON.stringify(obj);
  const encryptedString = encrypt(string, key);
  $.ajax({
    url: "/api/blob/post",
    data: JSON.stringify(encryptedString),
    contentType: "application/json",
    type: "POST",
    success: (resp) => {
      console.log("post typeof resp=", typeof resp, ", resp=", resp);
      successCallback(resp);
    },
    error: (err) => {
      console.log("err=", err);
      if (failCallback) {
        failCallback(err);
      }
    },
  });
}

function load(key, successCallback, failCallback) {
  $.ajax({
    url: "/api/blob/get",
    success: (encryptedBlob) => {
      console.log(
        "post typeof resp=",
        typeof resp,
        ", encryptedBlob=",
        encryptedBlob
      );
      if (encryptedBlob) {
        const plainBlob = decrypt(encryptedBlob, getKey());
        console.log("plainBlob=", plainBlob);
        let blobObj = {};
        try {
          blobObj = JSON.parse(plainBlob);
        } catch (err) {
          console.log("error parsing JSON err=", err);
          blobObj = {};
        }
        successCallback(blobObj);
      } else {
        console.log("no blob, return empty object");
        successCallback({});
      }
    },
    error: (err) => {
      console.log("err=", err);
      if (failCallback) {
        failCallback(err);
      }
    },
  });
}

const getKey = () => {
  let DBKEY = null;
  if (localStorage.getItem("DBKEY")) {
    DBKEY = localStorage.getItem("DBKEY");
  } else {
    DBKEY = crypto.randomUUID();
    localStorage.setItem("DBKEY", DBKEY);
  }
  console.log("DBKEY=", DBKEY);
  return DBKEY;
};

const setKey = () => {
  const v = $("#user_password").val();
  console.log("setKey v=", v);
  localStorage.setItem("DBKEY", v);
};
