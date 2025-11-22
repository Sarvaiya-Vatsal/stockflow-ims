import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'stockmaster'),
    password: configService.get<string>('DB_PASSWORD', 'stockmaster'),
    database: configService.get<string>('DB_DATABASE', 'stockmaster'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development', // Auto-sync in dev only
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: false,
  };
};

