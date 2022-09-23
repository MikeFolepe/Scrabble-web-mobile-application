import { AdministratorService } from '@app/services/admin/administrator.service';
import { AiType } from '@common/ai-name';
import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdministratorService) {}

    // @ApiOkResponse({
    //     description: 'Returns all courses',
    //     type: Course,
    //     isArray: true,
    // })
    // @ApiNotFoundResponse({
    //     description: 'Return NOT_FOUND http status when request fails',
    // })
    // @Get('/')
    // async allCourses(@Res() response: Response) {
    //     try {
    //         const allCourses = await this.coursesService.getAllCourses();
    //         response.status(HttpStatus.OK).json(allCourses);
    //     } catch (error) {
    //         response.status(HttpStatus.NOT_FOUND).send(error.message);
    //     }
    // }

    // @ApiOkResponse({
    //     description: 'Get course by subject code',
    //     type: Course,
    // })
    // @ApiNotFoundResponse({
    //     description: 'Return NOT_FOUND http status when request fails',
    // })
    // @Get('/:subjectCode')
    // async subjectCode(@Param('subjectCode') subjectCode: string, @Res() response: Response) {
    //     try {
    //         const course = await this.coursesService.getCourse(subjectCode);
    //         response.status(HttpStatus.OK).json(course);
    //     } catch (error) {
    //         response.status(HttpStatus.NOT_FOUND).send(error.message);
    //     }
    // }

    @ApiCreatedResponse({
        description: 'Returns all beginners ais',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/aiBeginners')
    async getAiBeginners(@Res() response: Response) {
        await this.adminService
            .getAllAiPlayers(AiType.beginner)
            .then((aiBeginners) => {
                response.status(HttpStatus.OK).send(aiBeginners);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to get ai beginners ' + error.message);
            });
    }

    @ApiCreatedResponse({
        description: 'Returns all experts ais',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/aiExperts')
    async getAiExperts(@Res() response: Response) {
        await this.adminService
            .getAllAiPlayers(AiType.expert)
            .then((aiExperts) => {
                response.status(HttpStatus.OK).send(aiExperts);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to get ai experts ' + error.message);
            });
    }

    @ApiCreatedResponse({
        description: 'Add new course',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/aiPlayers')
    async addCourse(@Body() ai, @Res() response: Response) {
        try {
            const aiPlayer = await this.adminService.addAiPlayer(ai.aiPlayer, ai.aiType);
            response.status(HttpStatus.CREATED).send(aiPlayer);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    // @ApiOkResponse({
    //     description: 'Modify a course',
    //     type: Course,
    // })
    // @ApiNotFoundResponse({
    //     description: 'Return NOT_FOUND http status when request fails',
    // })
    // @Patch('/')
    // async modifyCourse(@Body() courseDto: UpdateCourseDto, @Res() response: Response) {
    //     try {
    //         await this.coursesService.modifyCourse(courseDto);
    //         response.status(HttpStatus.OK).send();
    //     } catch (error) {
    //         response.status(HttpStatus.NOT_FOUND).send(error.message);
    //     }
    // }

    // @ApiOkResponse({
    //     description: 'Delete a course',
    // })
    // @ApiNotFoundResponse({
    //     description: 'Return NOT_FOUND http status when request fails',
    // })
    // @Delete('/:subjectCode')
    // async deleteCourse(@Param('subjectCode') subjectCode: string, @Res() response: Response) {
    //     try {
    //         await this.coursesService.deleteCourse(subjectCode);
    //         response.status(HttpStatus.OK).send();
    //     } catch (error) {
    //         response.status(HttpStatus.NOT_FOUND).send(error.message);
    //     }
    // }

    // @ApiOkResponse({
    //     description: 'Get a specific course teacher',
    //     type: String,
    // })
    // @ApiNotFoundResponse({
    //     description: 'Return NOT_FOUND http status when request fails',
    // })
    // @Get('/teachers/code/:subjectCode')
    // async getCourseTeacher(@Param('subjectCode') subjectCode: string, @Res() response: Response) {
    //     try {
    //         const teacher = await this.coursesService.getCourseTeacher(subjectCode);
    //         response.status(HttpStatus.OK).json(teacher);
    //     } catch (error) {
    //         response.status(HttpStatus.NOT_FOUND).send(error.message);
    //     }
    // }

    // @ApiOkResponse({
    //     description: 'Get specific teacher courses',
    //     type: Course,
    //     isArray: true,
    // })
    // @ApiNotFoundResponse({
    //     description: 'Return NOT_FOUND http status when request fails',
    // })
    // @Get('/teachers/name/:name')
    // async getCoursesByTeacher(@Param('name') name: string, @Res() response: Response) {
    //     try {
    //         const courses = await this.coursesService.getCoursesByTeacher(name);
    //         response.status(HttpStatus.OK).json(courses);
    //     } catch (error) {
    //         response.status(HttpStatus.NOT_FOUND).send(error.message);
    //     }
    // }
}
