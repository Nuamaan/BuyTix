import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@nuamaantickets/common_new";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    
    queueGroupName: string = queueGroupName
    
    async onMessage(data: OrderCreatedEvent["data"] , msg: Message) {
        
        const ticket = await Ticket.findById(data.ticket.id)

        if(!ticket){
            throw new Error('Ticket Not Found')
        }

        ticket.set({orderId:data.id})
        await ticket.save()

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            orderId: ticket.orderId,
            version: ticket.version,
            price: ticket.price,
            userId: ticket.userId
        })
        msg.ack()
    }
}