import fetch from 'node-fetch'

async function test() {
  const response = await fetch('http://localhost:3000/api/devices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'cmjoin79y00069z09upepkf11'
    },
    body: JSON.stringify({
      deviceId: 'test-simple-' + Date.now(),
      platform: 'ios',
      osVersion: '17.2'
    })
  })
  
  const text = await response.text()
  console.log('Status:', response.status)
  console.log('Response:', text.substring(0, 500))
}

test()
