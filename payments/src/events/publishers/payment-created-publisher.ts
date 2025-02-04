import { PaymentCreatedEvent, Publisher, Subjects } from "@nuamaantickets/common_new";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}