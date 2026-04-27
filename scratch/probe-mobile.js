const https = require('https');

function probe(url, auth) {
  return new Promise((resolve) => {
    const options = {
      headers: { 'Authorization': `Basic ${auth}` }
    };
    https.get(url, options, (res) => {
      console.log(`PROBE ${url} with 876407 -> Status: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', (e) => {
      console.log(`ERROR: ${e.message}`);
      resolve(500);
    });
  });
}

async function main() {
  const url = 'https://services.mobile.de/seller-api/v1/ads';
  
  // Test with Customer Number (876407) and the newest password
  const auth = Buffer.from('876407:iuewrMYlv2ND').toString('base64');
  await probe(url, auth);
}

main();
