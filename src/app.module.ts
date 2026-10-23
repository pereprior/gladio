import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { getEnvironmentFilePath } from '#src/config/environment.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: getEnvironmentFilePath(),
      expandVariables: true,
    }),
  ],
})
export class AppModule {}
