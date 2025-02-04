import { Publisher, Subjects, TicketCreatedEvent } from "@nuamaantickets/common_new";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated
}
