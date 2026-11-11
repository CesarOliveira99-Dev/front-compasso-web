import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GET, POST } from '../src/app/api/location/nearby/route';
test('nearby lookup validates origin and coordinates, hides the key, returns only city/state and limits paid requests', async t => {
  const original = process.env.GOOGLE_GEOCODING_API_KEY;
  t.after(()=>{ if(original===undefined)delete process.env.GOOGLE_GEOCODING_API_KEY;else process.env.GOOGLE_GEOCODING_API_KEY=original; });
  delete process.env.GOOGLE_GEOCODING_API_KEY;
  assert.equal((await GET().json()).enabled,false);
  process.env.GOOGLE_GEOCODING_API_KEY='private-fixture';
  const request=(body:unknown,origin='https://compasso.test')=>new Request('https://compasso.test/api/location/nearby',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const mock=t.mock.method(globalThis,'fetch',async()=>Response.json({status:'OK',results:[{address_components:[
    {long_name:'Assis',types:['administrative_area_level_2']},{short_name:'SP',types:['administrative_area_level_1']},{short_name:'BR',types:['country']}
  ]}]}));
  assert.equal((await POST(request({latitude:-22,longitude:-50},'https://other.test'))).status,403);
  assert.equal((await POST(request({latitude:91,longitude:0}))).status,400);
  assert.equal(mock.mock.calls.length,0);
  const response=await POST(request({latitude:-22.66123,longitude:-50.41123}));
  assert.deepEqual(await response.json(),{city:'Assis',state:'SP'});
  assert.equal(new URL(String(mock.mock.calls[0].arguments[0])).searchParams.get('latlng'),'-22.66,-50.41');
  let last:Response=response;
  for(let i=0;i<20;i++)last=await POST(request({latitude:-22,longitude:-50}));
  assert.equal(last.status,429); assert.equal(mock.mock.calls.length,20);
});
