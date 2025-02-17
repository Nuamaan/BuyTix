import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@nuamaantickets/common_new";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            userId: data.userId,
            price: data.ticket.price,
            status: data.status,
            version: data.version
        })
        await order.save()
        msg.ack()
    }
}