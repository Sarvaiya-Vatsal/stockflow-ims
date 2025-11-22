import { DataSource } from 'typeorm';
import { Role } from '../../users/entities/role.entity';

export async function createDefaultRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const defaultRoles = [
    {
      name: 'inventory_manager',
      permissions: {
        products: ['create', 'read', 'update', 'delete'],
        receipts: ['create', 'read', 'update', 'validate', 'cancel'],
        deliveryOrders: ['create', 'read', 'update', 'validate', 'cancel'],
        internalTransfers: ['create', 'read', 'update', 'validate', 'cancel'],
        stockAdjustments: ['create', 'read', 'update', 'validate', 'cancel'],
        settings: ['read', 'update'],
        dashboard: ['read'],
        moveHistory: ['read'],
        users: ['read'],
      },
    },
    {
      name: 'warehouse_staff',
      permissions: {
        products: ['read'],
        receipts: ['create', 'read', 'update'],
        deliveryOrders: ['create', 'read', 'update', 'pick', 'pack'],
        internalTransfers: ['read'],
        stockAdjustments: ['read'],
        settings: ['read'],
        dashboard: ['read'],
        moveHistory: ['read'],
        users: ['read'],
      },
    },
  ];

  for (const roleData of defaultRoles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`✅ Created role: ${roleData.name}`);
    } else {
      console.log(`⏭️  Role already exists: ${roleData.name}`);
    }
  }
}

