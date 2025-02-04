import { Publisher, Subjects, TicketCreatedEvent, TicketUpdatedEvent } from "@nuamaantickets/common_new";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
