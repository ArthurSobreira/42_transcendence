import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {FastifyReply, FastifyRequest} from "fastify";

export interface BaseHandlerQuery<TQuery, TResult = TQuery>
{
    Handle(command: TQuery, request?: FastifyRequest, reply?: FastifyReply, notificationError?: NotificationError): Promise<TResult>;
}
