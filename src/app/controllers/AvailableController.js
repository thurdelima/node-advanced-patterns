import AvailableService from '../services/AvailableService';

import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter
} from 'date-fns';
import Appointment from '../models/Appointment';
import { Op } from 'sequelize';

class AvailableController {

  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date'});
    }

    const searchDate = Number(date);

    
    const available = await AvailableService.run({
      date: searchDate,
      provider_id: req.params.providerId,
    })

    return res.json(available);
  }
}

export default new AvailableController();
