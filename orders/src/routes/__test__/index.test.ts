import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import request from 'supertest';
import mongoose from "mongoose";

const buildTicket = async () => {
    const ticket = Ticket.build({title:'concert',price:20,id: new mongoose.Types.ObjectId().toHexString()})
    await ticket.save()
    return ticket
}

it('fetches orders for a particular user', async () => {
    const ticket1 = await buildTicket()
    const ticket2 = await buildTicket()
    const ticket3 = await buildTicket()
    
    const userOne = global.signin()
    const userTwo = global.signin()

    const {body:orderOne} = await request(app)
        .post('/api/orders')
        .set('Cookie',userOne)
        .send({ticketId:ticket1.id})
        .expect(201)
                            
    const {body:orderTwo} = await request(app)
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ticketId:ticket2.id})
        .expect(201)

    const {body:orderThree} = await request(app)
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ticketId:ticket3.id})
        .expect(201)
    
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie',userTwo)
        .expect(200)
    
    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(orderTwo.id)
    expect(response.body[1].id).toEqual(orderThree.id)
    expect(response.body[0].ticket.id).toEqual(ticket2.id)
    expect(response.body[1].ticket.id).toEqual(ticket3.id)
    

})