import fs from 'fs'
import fileConfig from './course_data_pipeline/config/file.js'
import { updateScrapedSemesters } from './course_data_pipeline/utils/semester_tracker.js'
import { scrapeRawCourses } from './course_data_pipeline/stages/1-scrape_courses.js'
import { mapCoursesDept } from './course_data_pipeline/stages/2-map_courses_dept.js'
import { scrapeCoursesDetail } from './course_data_pipeline/stages/3-scrape_courses_detail.js'
import { processCoursesDetail } from './course_data_pipeline/stages/4-process_courses_detail.js'
import { getFlattenedCourses } from './course_data_pipeline/stages/5-get_flattened_courses.js'

;(async () => {
    try {
        console.log('開始爬取課程代碼...')

        const rawCourses = await scrapeRawCourses()

        const rawCoursesPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.raw
        )
        fs.writeFileSync(rawCoursesPath, JSON.stringify(rawCourses, null, 4));

        updateScrapedSemesters(rawCourses.semester)

        console.log(`爬取完成。學期: ${rawCourses.semester}`)

        // --------------------------------------------------

        const { mapped: mappedCourses, unmapped: unmappedCourses } = mapCoursesDept(rawCourses)

        const mappedCoursesPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.mapped
        )
        const unmappedCoursesPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.unmapped
        )

        fs.writeFileSync(mappedCoursesPath, JSON.stringify(mappedCourses, null, 4));
        fs.writeFileSync(unmappedCoursesPath, JSON.stringify(unmappedCourses, null, 4));

        // --------------------------------------------------

        const mappedCoursesDetail = await scrapeCoursesDetail(mappedCourses)
        const unmappedCoursesDetail = await scrapeCoursesDetail(unmappedCourses)

        const mappedCoursesDetailPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.mappedDetail
        )
        const unmappedCoursesDetailPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.unmappedDetail
        )

        fs.writeFileSync(mappedCoursesDetailPath, JSON.stringify(mappedCoursesDetail, null, 4));
        fs.writeFileSync(unmappedCoursesDetailPath, JSON.stringify(unmappedCoursesDetail, null, 4));

        // --------------------------------------------------

        const processedMappedCourses = processCoursesDetail(mappedCoursesDetail)
        const processedUnmappedCourses = processCoursesDetail(unmappedCoursesDetail)

        const processedMappedCoursesPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.processedMapped
        )
        const processedUnmappedCoursesPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.processedUnmapped
        )

        fs.writeFileSync(processedMappedCoursesPath, JSON.stringify(processedMappedCourses, null, 4));
        fs.writeFileSync(processedUnmappedCoursesPath, JSON.stringify(processedUnmappedCourses, null, 4));

        // --------------------------------------------------

        const flattenedCourses = getFlattenedCourses(mappedCoursesDetail, unmappedCoursesDetail)

        const flattenedCoursesPath = fileConfig.data.getCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.flattened
        )

        fs.writeFileSync(flattenedCoursesPath, JSON.stringify(flattenedCourses, null, 4));

        // --------------------------------------------------

        const finalMappedCoursesPath = fileConfig.data.getFinalCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.finalMapped
        )
        const finalUnmappedCoursesPath = fileConfig.data.getFinalCourseFilePath(
            rawCourses.semester, fileConfig.data.courseTypes.finalUnmapped
        )
        // const finalFlattenedCoursesPath = fileConfig.data.getFinalCourseFilePath(
        //     rawCourses.semester, fileConfig.data.courseTypes.finalFlattened
        // )

        fs.writeFileSync(finalMappedCoursesPath, JSON.stringify(processedMappedCourses, null, 4));
        fs.writeFileSync(finalUnmappedCoursesPath, JSON.stringify(processedUnmappedCourses, null, 4));
        // fs.writeFileSync(finalFlattenedCoursesPath, JSON.stringify(flattenedCourses, null, 4));

    } catch (err) {
        console.error(err)
    }
})()