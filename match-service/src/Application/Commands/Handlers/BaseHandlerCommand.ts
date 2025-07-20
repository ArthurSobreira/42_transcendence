export interface BaseHandlerCommand<TCommand>
{
    handle(command: TCommand): Promise<void>;
}