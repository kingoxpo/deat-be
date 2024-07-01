import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoginResponse, SignupResponse, User } from './entities/user.entitiy';
import { UserService } from 'src/api/service/user.service';
import { LoginInput, SignupInput } from './user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Mutation(() => SignupResponse)
  async signup(@Args('signupInput') signupInput: SignupInput) {
    return this.userService.signUp(signupInput);
  }

  @Mutation(() => LoginResponse, { nullable: true })
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return this.userService.login(loginInput);
  }
}
