import { db } from '../database/schema';
import { Customer } from '../models/types';

export class CustomerDbTool {
  public static readonly toolName = 'customer_database';
  public static readonly mcpName = 'customer-mcp';

  public async findCustomer(query: { email?: string; name?: string; id?: string }): Promise<Customer | null> {
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];

    if (query.id) {
      sql += ' AND id = ?';
      params.push(query.id);
    } else if (query.email) {
      sql += ' AND email = ?';
      params.push(query.email);
    } else if (query.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${query.name}%`);
    }

    const row = await db.get<Customer>(sql, params);
    return row || null;
  }

  public async getCustomerById(id: string): Promise<Customer | null> {
    const row = await db.get<Customer>('SELECT * FROM customers WHERE id = ?', [id]);
    return row || null;
  }
}

export const customerDbTool = new CustomerDbTool();
