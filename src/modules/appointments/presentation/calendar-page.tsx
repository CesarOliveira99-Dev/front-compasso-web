'use client';
import { StaffCalendar } from './staff-calendar';
import { openStaffAppointment } from './staff-appointment';
import { openBooking } from './booking-dialog';
import { useResource, type SectionProps } from '@/modules/shared/presentation/ui';
import { BusinessCover } from '@/modules/dashboard/presentation/business-cover';
import { BlocksPanel, FollowUpSummary } from '@/modules/workspace/presentation/client-care';
import type { AgendaBlock } from '@/modules/workspace/presentation/care-types';
import type { Appointment } from '@/modules/shared/domain/models';
export function CalendarPage(props:SectionProps) {
 const blocks=useResource<AgendaBlock[]>('workspace/care/blocks',props.revision);
 const virtual:Appointment[]=(blocks.value||[]).map(b=>({id:'block:'+b.id,customerId:'',customerName:'Bloqueado',itemId:'',itemName:b.title,professionalId:b.professionalId,professionalName:'',startsAt:b.startsAt,endsAt:b.endsAt,priceCents:0,status:'confirmed',paymentStatus:'pending',notes:b.title}));
 return <>{props.data.settings.workspaceMode!=='solo'&&<BusinessCover settings={props.data.settings}/>}<FollowUpSummary {...props}/><StaffCalendar data={{...props.data,appointments:[...props.data.appointments,...virtual]}} onManageBlocks={()=>props.openDialog({title:'Bloqueios da agenda',content:<BlocksPanel {...props}/>})} onOpen={a=>{if(a.id.startsWith('block:'))props.openDialog({title:'Horário bloqueado',content:<BlocksPanel {...props}/>});else openStaffAppointment(props,a)}} onNew={props.data.user.role==='admin'?()=>{void openBooking(props).catch(error=>props.notify(error.message,true))}:undefined}/></>;
}
