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

@ApiTags('allure')
@Controller('allure')
export class AllureController {
    constructor(private readonly service: AllureService) {}

    @Get('launches')
    getLaunches(@Query() query: GetLaunchesQueryDTO) {
        return this.service.getLaunches(query);
    }

    @Post('launches/:id/close')
    completeLaunch(@Param() params: CompleteLaunchParamDTO) {
        return this.service.completeLaunch(params.id);
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

    @Post('testresult/:id/resolve')
    resolveTestResult(
        @Param() params: TestResultIdParamDTO,
        @Body() body: ResolveTestResultBodyDTO
    ) {
        return this.service.resolveTestResult({ id: params.id, ...body });
    }

    @Post('testresult/:id/rerun')
    @HttpCode(200)
    rerunTestResult(@Param() params: TestResultIdParamDTO, @Body() body: RerunTestResultBodyDTO) {
        return this.service.rerunTestResult({ id: params.id, username: body.username });
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

    @Post('testplan/:id/run')
    runTestPlan(@Param() params: RunTestPlanParamDTO, @Body() body: RunTestPlanBodyDTO) {
        return this.service.runTestPlan({ id: params.id, launchName: body.launchName });
    }
}
