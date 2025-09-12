import { Module } from '@nestjs/common';
import { AllureService } from './services';
import { AllureController } from './controllers/';
import { AllureApi } from './api';

@Module({
    controllers: [AllureController],
    providers: [AllureApi, AllureService]
})
export class AllureModule {}
