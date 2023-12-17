import TicketModel from '../models/TicketModel.js';
import CustomError from '../../../services/customError.js';

class TicketDAO {

  static async createTicket(ticketData) {
    const ticket = await TicketModel.create(ticketData);
    return ticket;
  }

  static async getTicketByCode(ticketCode) {
    const ticket = await TicketModel.findOne({ code: ticketCode });
    if (!ticket) {
      throw new CustomError(`Ticket not found for code: ${ticketCode}`, 'QUERY_ERROR');
    }
    return ticket;
  }

}

export default TicketDAO;
