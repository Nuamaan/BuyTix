import { OrderCreatedEvent, Publisher, Subjects } from "@nuamaantickets/common_new";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated
}