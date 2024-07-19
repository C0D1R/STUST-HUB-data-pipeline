import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import cheerio from 'cheerio'
import { sel } from '../config/selectors.js'
import { retryOperation } from '../utils/network_utils.js'

puppeteer.use(StealthPlugin())

const scrapeRawCourses = async () => {
    const browser = await puppeteer.launch({
        // headless: false,
        // slowMo: 20,
        timeout: 0,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    const client = await page.target().createCDPSession()
    await client.send('Network.enable')
    await client.send('Network.setBlockedURLs', {
        urls: [
            '*.png', '*.jpg', '*.svg', '*.gif', '*.css',
            '*google-analytics.com*', '*doubleclick.net*',
        ]
    })

    await page.goto('https://course.stust.edu.tw/CourSel/Pages/NextCourse.aspx');
    
    const $ = cheerio.load(await page.content());

    const rawCourses = {
        semester: '',
        departments: []
    };

    rawCourses.semester = `${$(sel.semesterYear).text()}-${$(sel.semester).text()}`

    const deptOptions = Array.from($(sel.deptOptions));
    const typeOptions = Array.from($(sel.typeOptions));

    await retryOperation(async () => {
        await page.waitForSelector(sel.deptOptions);
    })
    for (const deptOption of deptOptions) {
        const deptData = new Set();
        const deptText = $(deptOption).text();
        console.log(deptText);

        const deptValue = $(deptOption).val();
        await retryOperation(async () => {
            await page.select(sel.deptSelect, deptValue);
            await page.waitForSelector(sel.classSelect);
        })

        const $2 = cheerio.load(await page.content());
        const classOptions = Array.from($2(sel.classOptions));

        for (const classOption of classOptions) {
            const classValue = $2(classOption).val();
            console.log(classValue);
            await retryOperation(async () => {
                await page.select(sel.classSelect, classValue);
            })

            for (const typeOption of typeOptions) {
                const typeValue = $(typeOption).val();
                await retryOperation(async () => {
                    await page.select(sel.typeSelect, typeValue);
                })

                for (let retrySearch = 0; retrySearch < 3; retrySearch++) {
                    await retryOperation(async () => {
                        await page.click(sel.submitButton);
                        await page.waitForSelector(sel.courseLastTr);
                    })

                    const noDataFound = await page.$(sel.courseNoFoundTd);
                    if (noDataFound === null) {
                        const havePager = await page.$(sel.coursePager);
                        
                        const coursePages = havePager ? (await page.$$(sel.coursePagerLinks)).length : 1;
                        for (let coursePage = 0; coursePage < coursePages; coursePage++) {
                            const html3 = await page.content();
                            const $3 = cheerio.load(html3);
                            
                            const courseLinks = $3(sel.courseLinks);
                            courseLinks.each((_, courseLink) => {
                                deptData.add($3(courseLink).attr('title'));
                            });

                            try {
                                const pagerButtons = await page.$$(sel.coursePagerLinks);
                                await pagerButtons[coursePage].click();
                                await page.waitForSelector(sel.courseLastTr);
                            }
                            catch (_) {
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }

        if (deptData.size) {
            rawCourses.departments.push({
                id: deptText,
                courses: Array.from(deptData)
            })
        }
    }

    await page.close();
    await browser.close();
    
    return rawCourses
}

export {
    scrapeRawCourses
}