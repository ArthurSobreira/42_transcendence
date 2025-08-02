import {BaseHandlerCommand} from "./BaseHandlerCommand.js";
import {UserRepository} from "../../../Infrastructure/Persistence/Repositories/Concrete/UserRepository.js";
import {NotificationError} from "../../../Shared/Errors/NotificationError.js";
import {UserSessionCommand} from "../CommandObject/UserSessionCommand.js";
import {PasswordHashVO} from "../../ValueObjects/PasswordHashVO.js";
import {LoginUserViewModel} from "../../../Application/ViewModels/LoginUserViewModel.js";
import {FastifyReply, FastifyRequest} from "fastify";
import {UserSessionDTO} from "../../../Application/DTO/ToCommand/UserSessionDTO.js";
import {User} from "../../Entities/Concrete/User.js";

export class LoginSessionCommandHandler implements BaseHandlerCommand<UserSessionCommand, LoginUserViewModel>
{
   private UserRepository: UserRepository;

   constructor(userRepository: UserRepository, notification: NotificationError)
   {
      this.UserRepository = userRepository;
   }

   async Handle(command: UserSessionCommand, request: FastifyRequest<{ Body: UserSessionDTO}>, reply: FastifyReply): Promise<LoginUserViewModel>
   {
      const user = await this.UserRepository.GetUserEntityByEmail(command.Email);

      user?.ChangeStatusOnline(command.isOnline);

      await this.UserRepository.Update(user!.Uuid, user);

      return this.GenerateToken(user, reply, request);
   }

   private GenerateToken(user: User | null, reply: FastifyReply, request: FastifyRequest<{ Body: UserSessionDTO }>)
   {
      const body = request.body;

      if (user && user.TwoFactorEnabled)
          return new LoginUserViewModel(null, user.Uuid, user.Username, user.ProfilePic);

      const token = reply.server.jwt.sign({
         uuid: user?.Uuid,
         username: user?.Username,
         isAuthenticated: true,
      }, { expiresIn: '1d' });

      reply.setCookie('token', token, {
         httpOnly: true,
         secure: true,
         sameSite: 'lax',
         path: '/',
      });

      return new LoginUserViewModel(token, user?.Uuid, user?.Username, user?.ProfilePic);
   }
}