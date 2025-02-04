import { Ticket } from "../ticket"

it('implements Optimistic Concurrency Control', async () => {
    const ticket = Ticket.build({title:"Concert" , price:10 , userId:'asdfsd'})
    await ticket.save()

    const instanceOne = await Ticket.findById(ticket.id)
    const instanceTwo = await Ticket.findById(ticket.id)

    instanceOne?.set({"price" : 10})
    await instanceOne?.save()

    instanceTwo?.set({"price" : 15})
    
    try{
        await instanceTwo?.save()     
    }
    catch{
        return 
    }

    throw new Error('Should not reach the point');
})

it('increments the version on every save', async () => {
    const ticket = Ticket.build({
        title:"Concert",
        price:20,
        userId:'asdfa'
    })
    await ticket.save()

    expect(ticket.version).toEqual(0)

    await ticket.save()
    expect(ticket.version).toEqual(1)

    await ticket.save()
    expect(ticket.version).toEqual(2)
})