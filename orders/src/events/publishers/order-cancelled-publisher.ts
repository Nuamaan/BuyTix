import { OrderCancelledEvent, Publisher, Subjects } from "@nuamaantickets/common_new";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}