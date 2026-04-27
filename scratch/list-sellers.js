const https = require('https');

function probe(url, auth) {
  return new Promise((resolve) => {
    const options = {
      headers: { 
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/vnd.de.mobile.api+json'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`DATA: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (e) => {
      console.log(`ERROR: ${e.message}`);
      resolve({ status: 500 });
    });
  });
}

async function main() {
  const auth = Buffer.from('ahmedabdalla:iuewrMYlv2ND').toString('base64');
  
  console.log("Listing sellers...");
  await probe('https://services.mobile.de/seller-api/sellers', auth);
}

main();
