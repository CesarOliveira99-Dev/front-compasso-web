// One owner of the in-flight upload budget per BFF process. Scale-out requires a shared budget.
export class UploadGate {
 private readonly active=new Set<string>();
 acquire(userId:string):(()=>void)|undefined {
  if(this.active.size>=2||this.active.has(userId))return;
  this.active.add(userId);let released=false;
  return ()=>{if(!released){released=true;this.active.delete(userId);}};
 }
}
