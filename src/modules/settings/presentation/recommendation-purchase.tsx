'use client';
import {useState} from 'react';
import {api} from '@/modules/shared/infrastructure/api';
import {money} from '@/modules/shared/domain/format';
import {useResource,ResourceState} from '@/modules/shared/presentation/ui';
export function RecommendationPurchase(){
 const result=useResource<{priceCents:number;days:number;enabled:boolean;entitlement:{expiresAt:string}|null}>('payments/recommendation',0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[key]=useState(()=>crypto.randomUUID());
 return <div className="form-grid"><ResourceState {...result}/>{result.value&&(result.value.enabled?<><p>{money(result.value.priceCents)} por {result.value.days} dias. Contratação avulsa, sem renovação automática. O selo também exige média mínima de 4,8 e 10 avaliações verificadas.</p>{result.value.entitlement&&<p>Vigência registrada até {new Date(result.value.entitlement.expiresAt).toLocaleDateString('pt-BR')}.</p>}<button type="button" className="button primary" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const value=await api<{url:string}>('payments/recommendation','POST',{idempotencyKey:key});location.assign(value.url);}catch(error){setError((error as Error).message);setBusy(false);}}}>Contratar adicional no Mercado Pago</button><p className="form-note">A ativação acontece após confirmação do pagamento. Expiração ou estorno retiram a validade do adicional.</p></>:<p>Preço e recebimento ainda em configuração. A contratação permanece desabilitada.</p>)}{error&&<p className="error-message" role="alert">{error}</p>}</div>;
}
