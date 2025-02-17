import request from 'supertest';
import {app} from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


it('has a route handler listening to /api/tickets for post requests',async () => {
    const response = await request(app)
                        .post('/api/tickets')
                        .send({})
    expect(response.statusCode).not.toEqual(404)
})


it('can only be accessed if user is signed in',async () => {
    await request(app)
            .post('/api/tickets')
            .send({})
            .expect(401)    
})


it('returns a status other than 401 when authenticated properly',async () => {
    const response = await request(app)
            .post('/api/tickets')
            .set('Cookie',global.signin())
            .send({})
    expect(response.statusCode).not.toEqual(401)  
})


it('returns an error if an invalid title is provided',async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title:'',
            price:10
        })
        .expect(400)
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            price:10
        })
        .expect(400)
})


it('returns an error if an invalid price is provided',async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title:'asfasdf',
            price:-10
        })
        .expect(400)
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title:'asdfasdf'
        })
        .expect(400)
})


it('creates a ticket with valid inputs',async () => {
    let tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0)
    
    const title = 'asfdasdfs'

    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title:title,
            price:20
        })
        .expect(201)
    
    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
    expect(tickets[0].price).toEqual(20)
    expect(tickets[0].title).toEqual(title)
})

it('sends out an event after creating a new ticket' , async () => {
    const title = 'asfdasdfs'

    await request(app)
        .post('/api/tickets')
        .set('Cookie',global.signin())
        .send({
            title:title,
            price:20
        })
        .expect(201)
    
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})