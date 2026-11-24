import {test} from 'node:test';
import assert from 'node:assert/strict';
import {boundedBody,BodyTooLarge} from '../src/modules/bff/infrastructure/bounded-body';
test('body limiter rejects declared and streamed oversized uploads and accepts exact limits',async()=>{
 await assert.rejects(boundedBody(new Request('https://fixture.test',{method:'POST',headers:{'Content-Length':'100'},body:'abc'}),3),BodyTooLarge);
 const stream=new ReadableStream<Uint8Array>({start(controller){controller.enqueue(new Uint8Array(5));controller.enqueue(new Uint8Array(5));controller.close();}});
 await assert.rejects(boundedBody(new Request('https://fixture.test',{method:'POST',body:stream,duplex:'half'} as any),8),BodyTooLarge);
 assert.equal((await boundedBody(new Request('https://fixture.test',{method:'POST',body:'abcd'}),4)).byteLength,4);
});

test('upload gate bounds process memory and releases safely after completion or failure',async()=>{const {UploadGate}=await import('../src/modules/bff/infrastructure/upload-gate');const gate=new UploadGate(),a=gate.acquire('a'),b=gate.acquire('b');assert.ok(a);assert.ok(b);assert.equal(gate.acquire('a'),undefined);assert.equal(gate.acquire('c'),undefined);a();a();assert.ok(gate.acquire('c'));});
