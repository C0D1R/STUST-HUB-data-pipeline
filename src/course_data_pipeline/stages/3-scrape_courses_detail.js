import axios from 'axios'
import cheerio from 'cheerio'
import useragent from 'fake-useragent'

const selector = {
    subcode:    '#CourseDetail_onepage1_lab_subcode',
    name:       '#CourseDetail_onepage1_lab_subname_ch',
    credit:     '#CourseDetail_onepage1_lab_credit',
    lecturer:   {
        name: '#CourseDetail_onepage1_GridView1 > tbody > tr > td:nth-child(1)',
        mail: '#CourseDetail_onepage1_GridView1 > tbody > tr > td:nth-child(4)'
    },
    type:       '#CourseDetail_onepage1_lab_rs',
    class:      '#CourseDetail_onepage1_lab_classname',
    time:       '#CourseDetail_onepage1_lab_room',
    location:   '#CourseDetail_onepage1_lab_room',
    language: '#form1 > div:nth-child(11) > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(7) > td.table_info_td_desc > span',
    capacity: {
        total: {
            max: '#CourseDetail_onepage1_lab_count11',
            current: '#CourseDetail_onepage1_lab_count12',
        },
        class: {
            max: '#CourseDetail_onepage1_lab_count21',
            current: '#CourseDetail_onepage1_lab_count22',
        },
        deptartment: {
            max: '#CourseDetail_onepage1_lab_count31',
            current: '#CourseDetail_onepage1_lab_count32',
        },
        external: {
            max: '#CourseDetail_onepage1_lab_count41',
            current: '#CourseDetail_onepage1_lab_count42',
        }
    }
}

const extractCourseDetails = (res, subcodes) => {
    const $ = cheerio.load(res.data);
    
    const subcode = $(selector.subcode).text();
    const courseIndex = subcodes.indexOf(subcode);

    if (courseIndex === -1) return;

    const lecturer = $(selector.lecturer.name).map((_, td) => ({
        name: $(td).text(),
        mail: $(selector.lecturer.mail).eq(_).text()
    })).get()

    subcodes[courseIndex] = {
        subcode:    $(selector.subcode).text(),
        name:       $(selector.name).text(),
        credit:     $(selector.credit).text(),
        lecturer:   lecturer,
        type:       $(selector.type).text(),
        class:      $(selector.class).text(),
        time:       $(selector.time).text(),
        location:   $(selector.location).text(),
        language:   $(selector.language).map((_, span) => $(span).text()).get(),
        capacity: {
            total: {
                max: $(selector.capacity.total.max).text(),
                current: $(selector.capacity.total.current).text(),
            },
            class: {
                max: $(selector.capacity.class.max).text(),
                current: $(selector.capacity.class.current).text(),
            },
            deptartment: {
                max: $(selector.capacity.deptartment.max).text(),
                current: $(selector.capacity.deptartment.current).text(),
            },
            external: {
                max: $(selector.capacity.external.max).text(),
                current: $(selector.capacity.external.current).text(),
            }
        }
    };
};

const fetchCourseDetails = async (subcode) => {
    return axios({
        method: 'get',
        url: `https://course.stust.edu.tw/CourSel/Pages/CourseInfo.aspx?role=S&subcode=${subcode}`,
        headers: { 'User-Agent': useragent() },
    });
};

const scrapeCoursesDetail = async (coursesData) => {
    coursesData = JSON.parse(JSON.stringify(coursesData))

    const requestsPerBatch = 10
    const minDelay = 500
    const maxDelay = 1500

    const promises = []

    for (const department of coursesData) {
        const subcodes = department.courses

        for (const subcode of subcodes) {
            promises.push(
                fetchCourseDetails(subcode)
                    .then((res) => extractCourseDetails(res, subcodes))
                    .catch((error) => {
                        console.error(`Error fetching details for subcode ${subcode}: ${error.message}`)
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
    scrapeCoursesDetail
}