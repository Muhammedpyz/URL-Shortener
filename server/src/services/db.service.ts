import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class DatabaseService {
    static async init() {
        console.log('Initializing database...');
        try {
            // This command pushes the state of your Prisma schema to the database
            // It creates tables if they don't exist and updates them if they do.
            // --accept-data-loss is used here for dev convenience, be careful in production!
            // --skip-generate is used because we generate client separately or it's already generated.
            const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss --skip-generate');

            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);

            console.log('Database synchronization complete.');
        } catch (error) {
            console.error('Failed to synchronize database:', error);
            // We might not want to crash the app, or maybe we do?
            // For now, let's just log it.
        }
    }
}
