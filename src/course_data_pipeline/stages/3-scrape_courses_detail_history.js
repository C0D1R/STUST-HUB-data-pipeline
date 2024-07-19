import axios from 'axios'
import cheerio from 'cheerio'
import useragent from 'fake-useragent'

const sel = {
    code: '#Course_Detail1_lbl_sub_code',
    name: {
        zh: '#Course_Detail1_lbl_sub_name',
        en: '#Course_Detail1_lbl_engsub_name'
    },
    credit: '#Course_Detail1_lbl_credit',
    type: '#Course_Detail1_lbl_RS',
    classes: '#Course_Detail1_lbl_class',
    instructors: '#Course_Detail1_lbl_tea',
    schedule: '#Course_Detail1_gv_schedule',
    hours: {
        course: '#Course_Detail1_lbl_hours',
        practice: '#Course_Detail1_lbl_practical_hour'
    },
    languages: '#form1 > div:nth-child(11) > div > table > tbody > tr:nth-child(11) > td:nth-child(2) > span',
    certificationsSupport: '#form1 > div:nth-child(11) > div > table > tbody > tr:nth-child(12) > td:nth-child(2) > span',
    description: '#Course_Detail1_lbl_indroduction',
    prerequisites: '#Course_Detail1_lbl_precondition',
    syllabus: {
        zh: '#Course_Detail1_lbl_content',
        en: '#Course_Detail1_lbl_eng_outline'
    },
    weeklySchedule: '#Course_Detail1_lbl_schedule',
    exams: {
        midterm: '#Course_Detail1_lbl_mid',
        final: '#Course_Detail1_lbl_last',
        other: '#Course_Detail1_lbl_usual'
    },
    teachingAndAssessment: '#Course_Detail1_gv_goal > tbody > tr:nth-child(n+2)',
    textbook: {
        title: '#Course_Detail1_lbl_textbook',
        author: '#Course_Detail1_lbl_author',
        publisher: '#Course_Detail1_lbl_publisher',
        year: '#Course_Detail1_lbl_publish_year',
        ISBN: '#Course_Detail1_lbl_ISBN',
        edition: '#Course_Detail1_lbl_edition'
    },
    referenceBooks: '#Course_Detail1_lbl_refbook',
    teachingSoftware: '#Course_Detail1_lbl_software',
    rules: '#Course_Detail1_lbl_note'
}

const extractCourseDetails = (res, codes) => {
    const $ = cheerio.load(res.data);
    
    const code = $(sel.code).text();
    const courseIndex = codes.indexOf(code);

    if (courseIndex === -1) return;

    const schedule = $(sel.schedule).length > 0
        ? $(sel.schedule).find('tr').map((index, row) => {
            const $cells = $(row).find('td')
            return {
                day: $cells.eq(0).text().trim(),
                period: $cells.eq(1).text().trim(),
                location: $cells.eq(2).text().trim().replace(/[()]/g, '')
            }
        }).get()
        : []

    const teachingAndAssessment = $(sel.teachingAndAssessment).map((index, row) => {
        const $cells = $(row).find('td')
        return {
            objective: $cells.eq(0).text().trim(),
            teachingMethods: $cells.eq(1).find('span')
                .map((_, el) => $(el).text().trim()).get(),
            assessmentMethods: $cells.eq(2).find('span:nth-of-type(odd)')
                .map((_, el) => {
                    const $method = $(el);
                    const $type = $method.nextAll('span').first();
                    return {
                        method: $method.text().trim(),
                        type: $type.text().trim()
                }
            }).get()
        }
    }).get()

    codes[courseIndex] = {
        code: $(sel.code).text().trim(),
        name: {
            zh: $(sel.name.zh).text().trim(),
            en: $(sel.name.en).text().trim()
        },
        credit: $(sel.credit).text().trim(),
        type: $(sel.type).text().trim(),
        classes: $(sel.classes).text().trim(),
        instructors: $(sel.instructors).text().trim(),
        schedule: schedule,
        hours: {
            course: $(sel.hours.course).text().trim(),
            practice: $(sel.hours.practice).text().trim()
        },
        languages: $(sel.languages).map((_, el) => $(el).text().trim()).get(),
        certificationsSupport: $(sel.certificationsSupport).map((_, el) => $(el).text().trim()).get(),
        description: $(sel.description).text().trim(),
        prerequisites: $(sel.prerequisites).text().trim(),
        syllabus: {
            zh: $(sel.syllabus.zh).text().trim(),
            en: $(sel.syllabus.en).text().trim()
        },
        weeklySchedule: $(sel.weeklySchedule).text().trim(),
        exams: {
            midterm: $(sel.exams.midterm).text().trim(),
            final: $(sel.exams.final).text().trim(),
            other: $(sel.exams.other).text().trim()
        },
        teachingAndAssessment: teachingAndAssessment,
        textbook: {
            title: $(sel.textbook.title).text().trim(),
            author: $(sel.textbook.author).text().trim(),
            publisher: $(sel.textbook.publisher).text().trim(),
            year: $(sel.textbook.year).text().trim(),
            ISBN: $(sel.textbook.ISBN).text().trim(),
            edition: $(sel.textbook.edition).text().trim()
        },
        referenceBooks: $(sel.referenceBooks).text().trim(),
        teachingSoftware: $(sel.teachingSoftware).text().trim(),
        rules: $(sel.rules).text().trim()
    };
};

const fetchCourseDetails = async (year, sems, code) => {
    return axios({
        method: 'get',
        url: `https://webap.stust.edu.tw/courinfo/CourseInfo.aspx?year=${year}&semes=${sems}&subcode=${code}`,
        headers: { 'User-Agent': useragent() },
    });
};

const scrapeHistoryCoursesDetail = async (coursesData, semseter) => {
    coursesData = JSON.parse(JSON.stringify(coursesData))
    const [ year, sems ] = semseter.split('-')

    const requestsPerBatch = 10
    const minDelay = 500
    const maxDelay = 1500

    const promises = []

    for (const department of coursesData) {
        const codes = department.courses

        for (const code of codes) {
            promises.push(
                fetchCourseDetails(year, sems, code)
                    .then((res) => extractCourseDetails(res, codes))
                    .catch((error) => {
                        console.error(`Error fetching details for subcode ${code}: ${error.message}`)
                    })
            );

            if (promises.length % requestsPerBatch === 0) {
                const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    await Promise.all(promises);

    return coursesData
}

export {
    scrapeHistoryCoursesDetail
}