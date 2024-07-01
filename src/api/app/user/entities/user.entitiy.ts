import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  token?: string;
}

@ObjectType()
export class SignupResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
