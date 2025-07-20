export interface IMatchRepository<TEntity> {
    Create(entity: TEntity): Promise<void>;
    Update(entity: TEntity): Promise<void>;
    FindByUuid(uuid: string): Promise<TEntity| null>;
    // Delete(uuid: string): Promise<void>;
    // GetAll(): Promise<TEntity[]>;
}