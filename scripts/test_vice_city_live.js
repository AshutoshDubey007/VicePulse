async function testApi() {
  const headers = {
    'x-api-key': 'vc_demo',
    'User-Agent': 'VicePulse-Sync/1.0',
    'Accept': 'application/json'
  };

  console.log('Testing GET https://vice-city.app/api/v1/ ...');
  const indexRes = await fetch('https://vice-city.app/api/v1/', { headers });
  console.log('Index status:', indexRes.status);
  const indexData = await indexRes.json();
  console.log('Index data:', JSON.stringify(indexData, null, 2));

  console.log('\nTesting GET https://vice-city.app/api/v1/types ...');
  const typesRes = await fetch('https://vice-city.app/api/v1/types', { headers });
  console.log('Types status:', typesRes.status);
  const typesData = await typesRes.json();
  console.log('Types data:', JSON.stringify(typesData, null, 2));

  console.log('\nTesting GET https://vice-city.app/api/v1/vehicles ...');
  const vehRes = await fetch('https://vice-city.app/api/v1/vehicles?limit=3', { headers });
  console.log('Vehicles status:', vehRes.status);
  const vehData = await vehRes.json();
  console.log('Vehicles sample:', JSON.stringify(vehData, null, 2).slice(0, 1000));

  console.log('\nTesting GET https://vice-city.app/api/v1/map/districts ...');
  const mapRes = await fetch('https://vice-city.app/api/v1/map/districts', { headers });
  console.log('Map status:', mapRes.status);
  const mapData = await mapRes.json();
  console.log('Map GeoJSON type:', mapData.type, 'features count:', mapData.features?.length);
  if (mapData.features?.[0]) {
    console.log('Sample feature:', JSON.stringify(mapData.features[0], null, 2).slice(0, 600));
  }
}

testApi().catch(console.error);
