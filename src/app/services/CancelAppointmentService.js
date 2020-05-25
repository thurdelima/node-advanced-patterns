import User from '../models/User';
import Appointment from '../models/Appointment';
import {startOfHour, parseISO, subHours, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Queue from '../../lib/Queue';
import Cache from '../../lib/Cache';
import CancellationMail from '../jobs/CancellationMail';

import Notification from '../models/schemas/Notification';

class CancelAppointmentService {
    
    async run({provider_id, user_id, date}) {
        
        const appointment = await Appointment.findByPk(provider_id, {
            include: [
              {
                model: User,
                as: 'provider',
                attributes: ['name', 'email'],
              },
              {
                model: User,
                as: 'user',
                attributes: ['name'],
              }
            ]
          });
      
          if (appointment.user_id !== req.userId) {
            

            throw new Error('You dont have permission to cancel this appointment.');
          }
      
          const dateWithSub = subHours(appointment.date, 2);
      
          if (isBefore(dateWithSub, new Date())) {
          
            throw new Error('You can only cancel appointments 2 hours in advance');
          }
      
          appointment.canceled_at = new Date();
      
          await appointment.save();
      
          await Queue.add(CancellationMail.key, {
            appointment,
          });

          //invalidate/destroy cache
          await Cache.invalidatePrefix(`user:${user_id}:appointments`);

          return appointment;
    }

}

export default new CancelAppointmentService();