import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import cheerio from 'cheerio'
import fs from 'fs'

import { sel } from './course_data_pipeline/config/selectors_history.js'
import fileConfig from './course_data_pipeline/config/file.js'
import { updateScrapedSemesters, isSemesterScraped } from './course_data_pipeline/utils/semester_tracker.js'

import { scrapeHistoryRawCourses } from './course_data_pipeline/stages/1-scrape_courses_history.js'
import { mapCoursesDept } from './course_data_pipeline/stages/2-map_courses_dept.js'
import { scrapeHistoryCoursesDetail } from './course_data_pipeline/stages/3-scrape_courses_detail_history.js'
import { getFlattenedCourses } from './course_data_pipeline/stages/4-get_flattened_courses.js'
import { extractCoursesSummaries } from './course_data_pipeline/stages/4-extract_course_summary.js'
import { processHistoryCoursesDetail } from './course_data_pipeline/stages/4-process_courses_detail_history.js'
import { processHistoryFlattenedCourses } from './course_data_pipeline/stages/5-process_flattened_courses_history.js'
import { processCoursesSummaries } from './course_data_pipeline/stages/5-process_course_summary.js'

puppeteer.use(StealthPlugin())

;(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://webap.stust.edu.tw/courinfo/');
    
        const $ = cheerio.load(await page.content());
        await page.close();
        await browser.close();

        const semesterOptions = Array.from($(sel.searchSelectOption.semester))
        const semesterValues = semesterOptions.map((semOption) => $(semOption).val())

        for (const semester of ['112-2']) {
            if (isSemesterScraped(semester)) continue

            console.log('開始爬取課程代碼...')

            // const historyRawCourses = await scrapeHistoryRawCourses(semester)
            
            const historyRawCoursesPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.raw
            )
            // fs.writeFileSync(historyRawCoursesPath, JSON.stringify(historyRawCourses, null, 4));

            // updateScrapedSemesters(semester)

            console.log(`爬取完成。學期: ${semester}`)
            const historyRawCourses = JSON.parse(fs.readFileSync(historyRawCoursesPath, 'utf-8'))
            // // --------------------------------------------------

            const { mapped: mappedCourses, unmapped: unmappedCourses } = mapCoursesDept(historyRawCourses)

            const mappedCoursesPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.mapped
            )
            const unmappedCoursesPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.unmapped
            )

            fs.writeFileSync(mappedCoursesPath, JSON.stringify(mappedCourses, null, 4));
            fs.writeFileSync(unmappedCoursesPath, JSON.stringify(unmappedCourses, null, 4));

            // --------------------------------------------------

            // const mappedCoursesDetail = await scrapeHistoryCoursesDetail(mappedCourses, semester)
            // const unmappedCoursesDetail = await scrapeHistoryCoursesDetail(unmappedCourses, semester)

            const mappedCoursesDetailPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.mappedDetail
            )
            const unmappedCoursesDetailPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.unmappedDetail
            )

            // fs.writeFileSync(mappedCoursesDetailPath, JSON.stringify(mappedCoursesDetail, null, 4));
            // fs.writeFileSync(unmappedCoursesDetailPath, JSON.stringify(unmappedCoursesDetail, null, 4));

            const mappedCoursesDetail = JSON.parse(fs.readFileSync(mappedCoursesDetailPath, 'utf-8'))
            const unmappedCoursesDetail = JSON.parse(fs.readFileSync(unmappedCoursesDetailPath, 'utf-8'))

            // // --------------------------------------------------

            const flattenedCourses = getFlattenedCourses(mappedCoursesDetail, unmappedCoursesDetail)

            const flattenedCoursesPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.flattened
            )

            fs.writeFileSync(flattenedCoursesPath, JSON.stringify(flattenedCourses, null, 4));

            // --------------------------------------------------

            const coursesSummary = extractCoursesSummaries(mappedCoursesDetail)
            const coursesSummaryPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.summary
            )
            fs.writeFileSync(coursesSummaryPath, JSON.stringify(coursesSummary, null, 4));

            // // --------------------------------------------------

            const coursesSummaryProcessed = processCoursesSummaries(coursesSummary)
            const coursesSummaryProcessedPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.summaryProcessed
            )
            fs.writeFileSync(coursesSummaryProcessedPath, JSON.stringify(coursesSummaryProcessed, null, 4));

            // // --------------------------------------------------

            const coursesFlattenedProcessed = processHistoryFlattenedCourses(flattenedCourses)
            const coursesFlattenedProcessedPath = fileConfig.data.getCourseFilePath(
                semester, fileConfig.data.courseTypes.flattenedProcessed
            )
            fs.writeFileSync(coursesFlattenedProcessedPath, JSON.stringify(coursesFlattenedProcessed, null, 4));

            // // --------------------------------------------------

            // const processedMappedCourses = processCoursesDetail(mappedCoursesDetail)
            // const processedUnmappedCourses = processCoursesDetail(unmappedCoursesDetail)

            // const processedMappedCoursesPath = fileConfig.data.getCourseFilePath(
            //     semester, fileConfig.data.courseTypes.processedMapped
            // )
            // const processedUnmappedCoursesPath = fileConfig.data.getCourseFilePath(
            //     semester, fileConfig.data.courseTypes.processedUnmapped
            // )

            // fs.writeFileSync(processedMappedCoursesPath, JSON.stringify(processedMappedCourses, null, 4));
            // fs.writeFileSync(processedUnmappedCoursesPath, JSON.stringify(processedUnmappedCourses, null, 4));

            // // --------------------------------------------------

            // const finalMappedCoursesPath = fileConfig.data.getFinalCourseFilePath(
            //     semester, fileConfig.data.courseTypes.finalMapped
            // )
            // const finalUnmappedCoursesPath = fileConfig.data.getFinalCourseFilePath(
            //     semester, fileConfig.data.courseTypes.finalUnmapped
            // )
            // // const finalFlattenedCoursesPath = fileConfig.data.getFinalCourseFilePath(
            // //     semester, fileConfig.data.courseTypes.finalFlattened
            // // )

            // fs.writeFileSync(finalMappedCoursesPath, JSON.stringify(processedMappedCourses, null, 4));
            // fs.writeFileSync(finalUnmappedCoursesPath, JSON.stringify(processedUnmappedCourses, null, 4));
            // // fs.writeFileSync(finalFlattenedCoursesPath, JSON.stringify(flattenedCourses, null, 4));

            break
        }
    } catch (err) {
        console.error(err)
    }
})()