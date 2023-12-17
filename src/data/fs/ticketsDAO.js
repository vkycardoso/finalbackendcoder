import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import CustomError from '../../services/customError.js';

const __dirname = path.resolve();

class TicketsDAO {
  #tickets = [];
  #path = `${__dirname}/src/data/fs/tickets_fs.json`;

  constructor(filePath) {
    if (filePath) {
      this.#setPath(filePath);
    }
    if (!fs.existsSync(this.#path)) {
      this.#saveFile();
    }
  }

  #setPath(path) {
    this.#path = path;
  }

  async #loadTickets() {
    try {
      const content = await fs.promises.readFile(this.#path, 'utf-8');
      this.#tickets = JSON.parse(content);
    } catch (error) {
      throw error;
    }
  }

  async #saveFile() {
    const content = JSON.stringify(this.#tickets);
    try {
      await fs.promises.writeFile(this.#path, content);
    } catch (error) {
      throw error;
    }
  }

  async createTicket(ticketData) {
    const ticket = {_id: uuidv4(), ...ticketData};
    this.#tickets.push(ticket);
    await this.#saveFile();
    return ticket;
  }

  async getTicketByCode(ticketCode) {
    await this.#loadTickets();
    const ticket = this.#tickets.find(ticket => ticket.code === ticketCode);
    if (!ticket) {
      throw new CustomError(`Ticket not found for code: ${ticketCode}`, 'QUERY_ERROR');
    }
    return ticket;
  }
}

export default TicketsDAO;
