import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllureService } from '../services';
import {
    CompleteLaunchParamDTO,
    GetLaunchesQueryDTO,
    GetLaunchItemsParamDTO,
    GetLaunchItemsQueryDTO,
    GetLaunchItemsTreeParamDTO,
    GetLaunchItemsTreeQueryDTO,
    GetTestPlansQueryDTO,
    RerunTestResultBodyDTO,
    ResolveTestResultBodyDTO,
    RunTestPlanBodyDTO,
    RunTestPlanParamDTO,
    TestResultIdParamDTO
} from '../dtos';
import { Auth, AuthUser, OptionalAuth, type Principal } from '../../auth';
import { USER_ROLE } from '../../users';

@ApiTags('allure')
@Controller('allure')
export class AllureController {
    constructor(private readonly service: AllureService) {}

    @OptionalAuth()
    @Get('launches')
    getLaunches(@Query() query: GetLaunchesQueryDTO, @AuthUser() user?: Principal) {
        return this.service.getLaunches(query, user);
    }

    @Auth([USER_ROLE.WALLET, USER_ROLE.ADMIN])
    @Post('launches/:id/close')
    completeLaunch(@Param() params: CompleteLaunchParamDTO, @AuthUser() user: Principal) {
        return this.service.completeLaunch(params.id, user);
    }

    @Get('launches/:launchId/items')
    getLaunchItems(
        @Param() params: GetLaunchItemsParamDTO,
        @Query() query: GetLaunchItemsQueryDTO
    ) {
        return this.service.getLaunchItems({ launchId: params.launchId, ...query });
    }

    @Get('launches/:launchId/items-tree')
    getLaunchItemsTree(
        @Param() params: GetLaunchItemsTreeParamDTO,
        @Query() query: GetLaunchItemsTreeQueryDTO
    ) {
        return this.service.getLaunchItemsTree({ launchId: params.launchId, ...query });
    }

    @Get('testresult/:id')
    getTestResult(@Param() params: TestResultIdParamDTO) {
        return this.service.getTestResult(params.id);
    }

    @Get('testresult/:id/full')
    getTestResultWithCustomFields(@Param() params: TestResultIdParamDTO) {
        return this.service.getTestResultWithCustomFields(params.id);
    }

    @Auth([USER_ROLE.WALLET, USER_ROLE.ADMIN])
    @Post('testresult/:id/resolve')
    resolveTestResult(
        @Param() params: TestResultIdParamDTO,
        @Body() body: ResolveTestResultBodyDTO,
        @AuthUser() user: Principal
    ) {
        return this.service.resolveTestResult({ id: params.id, ...body }, user);
    }

    // TODO
    @Auth([USER_ROLE.WALLET, USER_ROLE.ADMIN])
    @Post('testresult/:id/rerun')
    @HttpCode(200)
    rerunTestResult(
        @Param() params: TestResultIdParamDTO,
        @Body() body: RerunTestResultBodyDTO,
        @AuthUser() user: Principal
    ) {
        return this.service.rerunTestResult({ id: params.id, username: body.username }, user);
    }

    @Get('testresult/:id/cfv')
    getCustomFields(@Param() params: TestResultIdParamDTO) {
        return this.service.getCustomFields(params.id);
    }

    @Get('testresult/:id/execution')
    getExecution(@Param() params: TestResultIdParamDTO) {
        return this.service.getExecution(params.id);
    }

    @Get('testplan')
    getTestPlans(@Query() query: GetTestPlansQueryDTO) {
        return this.service.getTestPlans(query.projectId);
    }

    @Auth([USER_ROLE.WALLET, USER_ROLE.ADMIN])
    @Post('testplan/:id/run')
    runTestPlan(
        @Param() params: RunTestPlanParamDTO,
        @Body() body: RunTestPlanBodyDTO,
        @AuthUser() user: Principal
    ) {
        return this.service.runTestPlan({ id: params.id, launchName: body.launchName }, user);
    }
}
