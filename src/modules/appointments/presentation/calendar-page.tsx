'use client';
import { StaffCalendar } from './staff-calendar';
import { openStaffAppointment } from './staff-appointment';
import { openBooking } from './booking-dialog';
import type { SectionProps } from '@/modules/shared/presentation/ui';
export function CalendarPage(props: SectionProps) {
  return (
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
  );
}
