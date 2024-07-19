import fs from 'fs'
import fileConfig from '../config/file.js'

const SCRAPED_SEMESTERS_FILE = fileConfig.data.getTrackingFilePath(fileConfig.data.courseTypes.tracker)

const getScrapedSemesters = () => {
    if (fs.existsSync(SCRAPED_SEMESTERS_FILE)) {
        const data = fs.readFileSync(SCRAPED_SEMESTERS_FILE, 'utf8');
        return JSON.parse(data)
    }
    return []
}

const updateScrapedSemesters = (semester) => {
    const scrapedSemesters = getScrapedSemesters();
    if (!scrapedSemesters.includes(semester)) {
        scrapedSemesters.push(semester);
        fs.writeFileSync(SCRAPED_SEMESTERS_FILE, JSON.stringify(scrapedSemesters, null, 4));
    }
}

const isSemesterScraped = (semester) => {
    const scrapedSemesters = getScrapedSemesters();
    return scrapedSemesters.includes(semester);
}

export {
    updateScrapedSemesters,
    isSemesterScraped
}