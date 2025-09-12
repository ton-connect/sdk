import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getLaunchesQuerySchema = z.object({
    projectId: z.coerce.number(),
    search: z.string().optional(),
    page: z.coerce.number().int().nonnegative().optional().default(0),
    size: z.coerce.number().int().positive().optional().default(10),
    sort: z.string().optional().default('created_date,DESC')
});
export class GetLaunchesQueryDTO extends createZodDto(getLaunchesQuerySchema) {}

export const completeLaunchParamSchema = z.object({ id: z.coerce.number().int().positive() });
export class CompleteLaunchParamDTO extends createZodDto(completeLaunchParamSchema) {}

export const getLaunchItemsParamSchema = z.object({ launchId: z.coerce.number().int().positive() });
export class GetLaunchItemsParamDTO extends createZodDto(getLaunchItemsParamSchema) {}
export const getLaunchItemsQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().nonnegative().optional().default(0),
    size: z.coerce.number().int().positive().optional().default(100),
    sort: z.string().optional().default('name,ASC')
});
export class GetLaunchItemsQueryDTO extends createZodDto(getLaunchItemsQuerySchema) {}

export const getLaunchItemsTreeParamSchema = getLaunchItemsParamSchema;
export class GetLaunchItemsTreeParamDTO extends createZodDto(getLaunchItemsTreeParamSchema) {}
export const getLaunchItemsTreeQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().nonnegative().optional().default(0),
    size: z.coerce.number().int().positive().optional().default(100),
    path: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional()
});
export class GetLaunchItemsTreeQueryDTO extends createZodDto(getLaunchItemsTreeQuerySchema) {}

export const getLaunchItemTreeParamSchema = getLaunchItemsParamSchema;
export class GetLaunchItemTreeParamDTO extends createZodDto(getLaunchItemTreeParamSchema) {}
export const getLaunchItemTreeQuerySchema = z.object({
    path: z.union([z.coerce.number(), z.array(z.coerce.number())])
});
export class GetLaunchItemTreeQueryDTO extends createZodDto(getLaunchItemTreeQuerySchema) {}

export const testResultIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export class TestResultIdParamDTO extends createZodDto(testResultIdParamSchema) {}

export const resolveTestResultBodySchema = z.object({
    start: z.number(),
    stop: z.number(),
    duration: z.number(),
    status: z.string(),
    message: z.string().optional(),
    execution: z.unknown().optional()
});
export class ResolveTestResultBodyDTO extends createZodDto(resolveTestResultBodySchema) {}

export const rerunTestResultBodySchema = z.object({ username: z.string().min(1) });
export class RerunTestResultBodyDTO extends createZodDto(rerunTestResultBodySchema) {}

export const getTestPlansQuerySchema = z.object({ projectId: z.coerce.number().int().positive() });
export class GetTestPlansQueryDTO extends createZodDto(getTestPlansQuerySchema) {}
export const runTestPlanParamSchema = z.object({ id: z.coerce.number().int().positive() });
export class RunTestPlanParamDTO extends createZodDto(runTestPlanParamSchema) {}
export const runTestPlanBodySchema = z.object({ launchName: z.string().min(1) });
export class RunTestPlanBodyDTO extends createZodDto(runTestPlanBodySchema) {}
