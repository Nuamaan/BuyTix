import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'

it('returns a 404 if the id does not exist' , async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie',global.signin())
        .send({
            title:'asdfa',
            price:20
        })
        .expect(404)
})

it('returns a 401 if the user is not authenticated' , async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title:'asdfa',
            price:20
        })
        .expect(401)
})

it('returns a 401 if the user does not own the ticket' , async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title:'dummy title',
            price:201
        })
        .expect(201)
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',global.signin())
        .send({
            title: 'New Title',
            price: 500
        })
        .expect(401)

})

it('returns a 400 if the user provides an invalid title or price' , async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'Test',
            price:20
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: '',
            price:50
        })
        .expect(400)
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'Changed Title',
            price:-50
        })
        .expect(400)
})

it('updates the ticket provided valid inputs' , async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'Test',
            price:20
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'New Title',
            price:50
        })
        .expect(200)
    
    const ticket = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
    
    expect(ticket.body.title).toEqual('New Title')
    expect(ticket.body.price).toEqual(50)
})

it('sends out an event after a ticket is updated', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'Test',
            price:20
        })

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'New Title',
            price:50
        })
        .expect(200)
    
        expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved' , async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie',cookie)
        .send({
            title: 'Test',
            price:20
        })
    const ticket = await Ticket.findById(response.body.id);
    ticket?.set({orderId : new mongoose.Types.ObjectId().toHexString()})
    await ticket?.save()

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'New Title',
            price:50
        })
        .expect(400)
})