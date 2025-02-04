import { ExpirationCompleteEvent, Publisher, Subjects } from "@nuamaantickets/common_new";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}