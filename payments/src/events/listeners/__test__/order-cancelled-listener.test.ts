import { Listener, OrderCancelledEvent, OrderStatus } from "@nuamaantickets/common_new";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)
    const order = Order.build({
        id : new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: 'asdfa',
        price: 10,
        status: OrderStatus.Created
    })
    await order.save()

    const data : OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asdfasdf'
        }
    }

    //@ts-ignore
    const msg : Message = {
        ack: jest.fn()
    }

    return {listener,order,data,msg}
}

it('updates the status of the order', async () => {
    const {listener,data,msg,order} = await setup()
    
    await listener.onMessage(data,msg)

    const fetchedOrder = await Order.findOne({
        _id: data.id,
        // version: data.version - 1
    })

    expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('cancels the order', async () => {
    const {listener,data,msg,order} = await setup()
    
    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled()
})