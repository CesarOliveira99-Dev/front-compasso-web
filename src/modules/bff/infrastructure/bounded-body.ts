export class BodyTooLarge extends Error {}
export async function boundedBody(request:Request, maximum:number):Promise<Uint8Array> {
  const length=request.headers.get('content-length');
  if(length && (!/^\d+$/.test(length) || Number(length)>maximum))throw new BodyTooLarge();
  if(!request.body)return new Uint8Array();
  const reader=request.body.getReader();let size=0,expired=false;const chunks:Uint8Array[]=[];
  const timeout=setTimeout(()=>{expired=true;void reader.cancel();},30000);
  try { for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw new BodyTooLarge();}chunks.push(value);} }
  finally{clearTimeout(timeout);reader.releaseLock();}
  if(expired)throw new Error('Tempo de envio esgotado.');
  const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}return body;
}
