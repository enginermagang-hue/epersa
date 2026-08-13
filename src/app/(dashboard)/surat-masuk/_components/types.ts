export type IncomingLetterRow = {
  id: number;
  agendaNumber: string | null;
  letterNumber: string;
  letterDate: string;
  receivedDate: string;
  sender: string;
  subject: string;
  classification: string | null;
  priority: string;
  status: string;
  attachmentCount: number | null;
  description: string | null;
};
