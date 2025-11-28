import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class DatabaseService {
    static async init(retries = 3, delay = 2000) {
        console.log('Initializing database...');
        for (let i = 0; i < retries; i++) {
            try {
                // This command pushes the state of your Prisma schema to the database
                const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss --skip-generate');

                if (stdout) console.log(stdout);
                if (stderr) console.error(stderr);

                console.log('Database synchronization complete.');
                return; // Success
            } catch (error) {
                console.error(`Failed to synchronize database (Attempt ${i + 1}/${retries}):`, error);
                if (i < retries - 1) {
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    console.error('All database synchronization attempts failed.');
                    // Don't throw, just log. Server might still work if DB is up but push failed.
                }
            }
        }
    }
}
