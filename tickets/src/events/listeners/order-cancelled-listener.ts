import { Listener, OrderCancelledEvent, Subjects } from "@nuamaantickets/common_new";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
    queueGroupName: string = queueGroupName 

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)

        if(!ticket){
            throw new Error('Ticket not found')
        }

        ticket.set({orderId : undefined})

        await ticket.save()

        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId, 
            version: ticket.version,
            orderId: ticket.orderId
        })

        msg.ack()
    }
}