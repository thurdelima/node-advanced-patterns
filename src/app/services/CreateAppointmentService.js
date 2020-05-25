import User from '../models/User';
import Appointment from '../models/Appointment';
import {startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Notification from '../models/schemas/Notification';

import Cache from '../../lib/Cache';


class CreateAppointmentService {
    async run({provider_id, user_id, date}) {
        
        
        // check if provider_id is a provider
        const isProvider = await User.findOne({
            where: { id: provider_id, provider: true },
        });
  
      // if (provider_id === req.userId) {
      //   return res
      //     .status(401)
      //     .json({ error: 'Dont create appointment because the same provider and user' });
      // }
  
      if (!isProvider) {
        throw new Error('You can only create appointments with providers');
      }
  
      const hourStart = startOfHour(parseISO(date));
  
      //validacao caso for uma data passada
      if (isBefore(hourStart, new Date())) {
        throw new Error('Past dates are not permitted');
      }
  
      //validacao caso algo ja foi marcado nessa data
      const checkAvailability = await Appointment.findOne({
        where: {
          provider_id,
          canceled_at: null,
          date: hourStart,
        },
      });
  
      if (checkAvailability) {
        throw new Error('Appointment date is not available');
      }
  
      const appointment = await Appointment.create({
        user_id,
        provider_id,
        date,
      });
  
      //notificar prestador de servicos
      const user = await User.findByPk(req.userId);
      const formattedDate = format(
        hourStart,
        "'dia' dd 'de' MMMM', às' H:mm'h'",
        { locale: pt}
      );
  
      await Notification.create({
        content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
        user: provider_id,
      });

      //invalidate/destroy cache
      await Cache.invalidatePrefix(`user:${user.id}:appointments`);

      return appointment;
    }

}

export default new CreateAppointmentService();