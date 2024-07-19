import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = 'data'
const BASE_DIR = path.join(DATA_DIR, 'courses_data')
const FINAL_DIR = path.join(DATA_DIR, 'courses_data_final')
const TRACKING_DIR = path.join(DATA_DIR, 'courses_tracking')

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

export default {
    data: {
        getCourseFilePath: (semester, fileType) => {
            const dirPath = path.join(BASE_DIR, semester)
            const fileName = `${semester}_${fileType}.json`

            ensureDirectoryExists(dirPath)
            return path.join(dirPath, fileName)
        },
        getFinalCourseFilePath: (semester, fileType) => {
            const dirPath = path.join(FINAL_DIR, semester)
            const fileName = `${semester}_${fileType}.json`

            ensureDirectoryExists(dirPath)
            return path.join(dirPath, fileName)
        },
        getTrackingFilePath: (fileType) => {
            const fileName = `${fileType}.json`

            ensureDirectoryExists(TRACKING_DIR)
            return path.join(TRACKING_DIR, fileName)
        },
        courseTypes: {
            raw: 'courses_raw',
            mapped: 'courses_mapped',
            unmapped: 'courses_unmapped',
            mappedDetail: 'courses_detail_mapped',
            unmappedDetail: 'courses_detail_unmapped',
            processedMapped: 'courses_final_mapped',
            processedUnmapped: 'courses_final_unmapped',

            flattened: 'courses_flattened',
            flattenedProcessed: 'courses_flattened_processed',

            summary: 'courses_summary',
            summaryProcessed: 'courses_summary_processed',

            
            finalMapped: 'courses_grouped',
            finalUnmapped: 'courses_grouped_unmapped',
            finalFlattened: 'courses',

            tracker: 'scraped_semesters'
        }
    }
}