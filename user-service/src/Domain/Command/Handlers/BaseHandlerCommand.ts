import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {FastifyReply, FastifyRequest} from "fastify";

export interface BaseHandlerCommand<TCommand, TResult = TCommand>
{
    Handle(command: TCommand, request?: FastifyRequest, reply?: FastifyReply, notificationError?: NotificationError): Promise<TResult>;
}