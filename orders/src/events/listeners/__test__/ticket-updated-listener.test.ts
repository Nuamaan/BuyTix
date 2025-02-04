import mongoose, { mongo } from "mongoose"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"
import { TicketUpdatedEvent } from "@nuamaantickets/common_new"
import { Message } from "node-nats-streaming"

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client)
    const id = new mongoose.Types.ObjectId().toHexString()

    const ticket = Ticket.build({
        id,
        title: "Concert",
        price: 20
    })
    await ticket.save()

    const data:TicketUpdatedEvent["data"] = {
        id,
        title: "Concet 1",
        price: 45,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    }

    //@ts-ignore
    const msg:Message = {
        ack: jest.fn()
    }

    return {listener,ticket,data,msg}
}

it('updates and saves the ticket', async () => {
    const {listener,ticket,data,msg} = await setup()

    await listener.onMessage(data,msg)

    const fetchedTicket = await Ticket.findById(ticket.id)

    expect(fetchedTicket?.title).toEqual(data.title)
    expect(fetchedTicket?.price).toEqual(data.price)
    expect(fetchedTicket?.version).toEqual(data.version)

})

it('acks the message' , async () => {
    const {listener,ticket,data,msg} = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('does not call the ack if the event has a skipped version number', async () => {
    const {msg, data, listener,ticket} = await setup();

    data.version = 10 

    try {
        await listener.onMessage(data,msg);
    } catch (error) {
        
    }
    
    expect(msg.ack).not.toHaveBeenCalled();

})