import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';
import { createDefaultRoles } from './create-default-roles';

async function runSeeds() {
  const configService = new ConfigService();
  const config = getDatabaseConfig(configService);

  const dataSource = new DataSource({
    ...config,
    type: 'postgres',
  } as any);

  try {
    await dataSource.initialize();
    console.log('📦 Running database seeds...\n');

    await createDefaultRoles(dataSource);

    console.log('\n✅ Seeds completed successfully!');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeds();

