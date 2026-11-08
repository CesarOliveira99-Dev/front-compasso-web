'use client';
import { StaffCalendar } from './staff-calendar';
import { openStaffAppointment } from './staff-appointment';
import { openBooking } from './booking-dialog';
import type { SectionProps } from '@/modules/shared/presentation/ui';
import { BusinessCover } from '@/modules/dashboard/presentation/business-cover';
export function CalendarPage(props: SectionProps) {
  return (
    <>
      <BusinessCover settings={props.data.settings} />
      <StaffCalendar
        data={props.data}
        onOpen={(appointment) => openStaffAppointment(props, appointment)}
        onNew={
          props.data.user.role === 'admin'
            ? () => {
                void openBooking(props).catch((error) => props.notify(error.message, true));
              }
            : undefined
        }
      />
    </>
  );
}
