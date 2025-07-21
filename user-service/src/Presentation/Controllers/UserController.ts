import { CreateUserDTO } from "../../Application/DTO/ToCommand/CreateUserDTO.js";
import { Result } from "../../Shared/Utils/Result.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "./BaseController.js";
import { CreateUserService } from "../../Application/Services/Concrete/CreateUserService.js";
import { NotificationError } from "../../Shared/Errors/NotificationError.js";
import { EditUserDTO } from "../../Application/DTO/ToCommand/EditUserDTO.js";
import { EditUserService } from "../../Application/Services/Concrete/EditUserService.js";
import { DeleteUserDTO } from "../../Application/DTO/ToCommand/DeleteUserDTO.js";
import { DeleteUserService } from "../../Application/Services/Concrete/DeleteUserService.js";
import { GetUserDTO } from "../../Application/DTO/ToQuery/GetUserDTO.js";
import { GetUserService } from "../../Application/Services/Concrete/GetUserService.js";
import { GetUserViewModel } from "../../Application/ViewModels/GetUserViewModel.js";
import { UserRepository } from "../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import { VerifyIfUsersExistsByUuidsDTO } from "../../Application/DTO/ToQuery/VerifyIfUsersExistsByUuidsDTO.js";
import { UserService } from "../../Application/Services/Concrete/UserService.js";
import { UpdateStatsDTO } from "../../Application/DTO/ToCommand/UpdateStatsDTO.js";
import { VerifyIfUserExistsByUsernameDTO } from "../../Application/DTO/ToQuery/VerifyIfUserExistsByUsernameDTO.js";
import { VerifyIfUsersExistsByUsernamesDTO } from "../../Application/DTO/ToQuery/VerifyIfUsersExistsByUsernamesDTO.js";

export class UserController extends BaseController {
  private readonly notificationError: NotificationError;
  private readonly createUserService: CreateUserService;
  private readonly editUserService: EditUserService;
  private readonly deleteUserService: DeleteUserService;
  private readonly getUserService: GetUserService;
  private readonly userRepository: UserRepository;
  private readonly userService: UserService;

  constructor(
    createUserService: CreateUserService,
    editUserService: EditUserService,
    deleteUserService: DeleteUserService,
    getUserService: GetUserService,
    userRepository: UserRepository,
    userService: UserService
  ) {
    super();
    this.notificationError = new NotificationError();
    this.createUserService = createUserService;
    this.editUserService = editUserService;
    this.deleteUserService = deleteUserService;
    this.getUserService = getUserService;
    this.userRepository = userRepository;
    this.userService = userService;
  }

  public async CreateUser(request: FastifyRequest<{ Body: CreateUserDTO }>, reply: FastifyReply): Promise<Result> {
    const body = request.body;
    const userDTO: CreateUserDTO = new CreateUserDTO(body.email, body.password, body.username, body.annonymous, body.profilePic, body.lastLogin);
    const result: Result = await this.createUserService.Execute(userDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }

  public async EditUser(request: FastifyRequest<{ Body: EditUserDTO }>, reply: FastifyReply): Promise<Result> {
    const body = request.body;
    const userDTO: EditUserDTO = new EditUserDTO(body.uuid, body.email, body.password, body.username, body.anonymous, body.profilePic);
    const result: Result = await this.editUserService.Execute(userDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }

  public async DeleteUser(request: FastifyRequest<{ Body: DeleteUserDTO }>, reply: FastifyReply): Promise<Result> {
    const body = request.body;
    const userDTO: DeleteUserDTO = new DeleteUserDTO(body.Uuid);
    const result: Result = await this.deleteUserService.Execute(userDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }

  public async GetUser(request: FastifyRequest<{ Querystring: GetUserDTO }>, reply: FastifyReply): Promise<Result> {
    const query = request.query;
    const userDTO: GetUserDTO = new GetUserDTO(query.uuid, query.email, query.username, query.profilePic);
    const result: Result<GetUserViewModel> = await this.getUserService.Execute(userDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }

  public async VerifyIfUsersExistsByUuids(request: FastifyRequest<{ Querystring: { uuids: (string | null)[] } }>, reply: FastifyReply): Promise<Result> {
    const query = request.query;
    const usersDTO: VerifyIfUsersExistsByUuidsDTO = new VerifyIfUsersExistsByUuidsDTO(query.uuids);
    const result: Result<boolean> = await this.userService.VerifyIfUserExistsByUuidsService(usersDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }

  //Verifica se a lista de pessoas existem
  public async VerifyIfUsersExistsByUsernames(request: FastifyRequest<{ Querystring: { usernames: (string | null)[] } }>, reply: FastifyReply): Promise<Result> {
    const query = request.query;
    const usersDTO: VerifyIfUsersExistsByUsernamesDTO = new VerifyIfUsersExistsByUsernamesDTO(query.usernames);
    const result: Result<boolean> = await this.userService.VerifyIfUsersExistsByUsernamesService(usersDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }

  //Verifica se uma pessoa existe
  public async VerifyIfUserExistsByUsername(request: FastifyRequest<{ Querystring: { username: string } }>, reply: FastifyReply): Promise<Result> {
    const query = request.query;
    const userDTO: VerifyIfUserExistsByUsernameDTO = new VerifyIfUserExistsByUsernameDTO(query.username);
    const result: Result<boolean> = await this.userService.VerifyIfUserExistsByUsernameService(userDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }

  public async findOne(request: FastifyRequest<{ Params: { uuid: string } }>, reply: FastifyReply) {
    try {
      const { uuid } = request.params;
      const dto = new GetUserDTO(uuid);
      const result: Result<GetUserViewModel> = await this.getUserService.Execute(dto, reply);
      return this.handleResult(result, reply, this.notificationError);
    } catch (error: any) {
      throw error;
    }
  }

  public async GetAllUsers(request: FastifyRequest, reply: FastifyReply): Promise<Result> {
    const result: Result<GetUserViewModel[]> = await this.getUserService.GetAllUsers();
    return this.handleResult(result, reply, this.notificationError);
  }

  public async UpdateUserStatus(uuid: string, isOnline: boolean, reply: FastifyReply): Promise<Result> {
    try {
      const user = await this.userRepository.GetUserEntityByUuid(uuid);
      if (!user) {
        return this.handleResult(Result.Failure("Usuário não encontrado."), reply, this.notificationError);
      }

      user.ChangeStatusOnline(isOnline);
      await this.userRepository.Update(uuid, user);
      return this.handleResult(Result.Sucess("Status do usuário atualizado."), reply, this.notificationError);
    } catch (error) {
      return this.handleResult(Result.Failure("Erro ao atualizar o status do usuário."), reply, this.notificationError);
    }
  }

  public async UpdateStats(request: FastifyRequest<{ Body: UpdateStatsDTO }>, reply: FastifyReply): Promise<Result> {
    const query = request.body;
    const statsDTO: UpdateStatsDTO = new UpdateStatsDTO(
      query.player1Username,
      query.player1Points,
      query.player2Username,
      query.player2Points,
      query.player3Username,
      query.player3Points,
      query.player4Username,
      query.player4Points,
    );
    const result: Result<void> = await this.userService.UpdateStatsService(statsDTO, reply);
    return this.handleResult(result, reply, this.notificationError);
  }
}