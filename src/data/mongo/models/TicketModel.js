import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true,
    unique: true
  },
  purchase_datetime: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: { //email
    type: String,
    required: true
  }
});

const TicketModel = mongoose.model('tickets', ticketSchema);

export default TicketModel;
