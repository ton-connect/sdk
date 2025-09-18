import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';
import { HasherService } from '../src/auth';
import { USER_ROLE, UsersService } from '../src/users';

async function run() {
    const login = process.env.USER_LOGIN;
    if (!login) {
        console.error('No USER_LOGIN provided');
        return process.exit(1);
    }
    const password = process.env.USER_PASSWORD;
    if (!password) {
        console.error('No USER_PASSWORD provided');
        return process.exit(1);
    }

    const app = await NestFactory.create(AppModule);
    const usersService = app.get(UsersService);
    const hasher = app.get(HasherService);

    const passwordHash = await hasher.hash(password);

    try {
        await usersService.create({
            login,
            passwordHash,
            role: USER_ROLE.ADMIN
        });
        console.log(`User (login=${login}, password=${password}) created successfully.`);
    } catch (e) {
        console.error('Error while creating admin', e);
        process.exit(1);
    } finally {
        await app.close();
    }
}

run().catch(console.error);
