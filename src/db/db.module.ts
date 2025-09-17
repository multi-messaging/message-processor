import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { environment } from 'src/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: environment.db.host,
      port: environment.db.port,
      username: environment.db.user,
      password: environment.db.password,
      database: environment.db.name,
      autoLoadEntities: true,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
      maxQueryExecutionTime: 30000,
      poolSize: 10,
      timezone: '-05:00',
    }),
  ],
  controllers: [],
  providers: [],
})
export class DBModule {}
