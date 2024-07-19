import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import cheerio from 'cheerio'
import { sel } from '../config/selectors_history.js'
import { retryOperation } from '../utils/network_utils.js'

puppeteer.use(StealthPlugin())

const scrapeHistoryRawCourses = async (semesterValue) => {
    const browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 20,
        timeout: 0,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage()

    const client = await page.target().createCDPSession()
    await client.send('Network.enable')
    await client.send('Network.setBlockedURLs', {
        urls: [
            '*.png', '*.jpg', '*.svg', '*.gif', '*.css',
            '*google-analytics.com*', '*doubleclick.net*',
        ]
    })

    await page.goto('https://webap.stust.edu.tw/courinfo/')

    const historyRawCourses = {
        semester: semesterValue,
        departments: []
    }

    await retryOperation(async () => {
        await page.waitForSelector(sel.searchForm);
        await page.select(sel.searchSelect.semester, semesterValue);
        await page.waitForSelector(sel.searchForm);
    })
    
    const $ = cheerio.load(await page.content());
    const options = {
        department: Array.from($(sel.searchSelectOption.department)),
        courseType: Array.from($(sel.searchSelectOption.courseType)),
    }

    for (const deptOption of options.department) {
        const departmentValue = $(deptOption).val()
        const departmentText = $(deptOption).text().trim()

        await retryOperation(async () => {
            await page.select(sel.searchSelect.department, departmentValue);
            await page.waitForSelector(sel.searchForm);
        })

        const subcodes = new Set()

        const $2 = cheerio.load(await page.content())
        options.class = Array.from($2(sel.searchSelectOption.class))

        for (const classOption of options.class) {
            const classValue = $2(classOption).val()
            console.log(classValue)

            await retryOperation(async () => {
                await page.select(sel.searchSelect.class, classValue);
                await page.waitForSelector(sel.searchForm);
            })

            for (const typeOption of options.courseType) {
                const courseTypeValue = $(typeOption).val()

                await retryOperation(async () => {
                    await page.select(sel.searchSelect.courseType, courseTypeValue)
                })

                for (let retrySearch = 0; retrySearch < 3; retrySearch++) {
                    await retryOperation(async () => {
                        await page.click(sel.searchButton);
                        await page.waitForSelector(sel.courseTable)
                    })

                    const noData = await page.$(sel.courseTableData.noData);
                    if (noData === null) {
                        const $3 = cheerio.load(await page.content())
                        
                        $3(sel.courseTableData.subcodes).each((_, subcode) => {
                            subcodes.add($3(subcode).text());
                        });

                        break
                    }
                }
            }
        }

        if (subcodes.size) {
            historyRawCourses.departments.push({
                id: departmentText,
                courses: Array.from(subcodes)
            })
        }
    }

    await page.close()
    return historyRawCourses
}

export {
    scrapeHistoryRawCourses
};