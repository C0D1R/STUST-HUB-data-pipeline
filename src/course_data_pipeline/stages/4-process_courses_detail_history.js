const processHistoryCoursesDetail = (coursesData) => {
    coursesData = JSON.parse(JSON.stringify(coursesData))

    coursesData.forEach((department) => {
        department.courses.forEach((course) => {
            course.credit = course.credit.replace(/\..*/gm, '').trim();
            
            course.classes = course.classes.split(',').map((classValue) => classValue.trim())

            course.instructors = course.instructors.split(',').map((instructor) => instructor.trim())

            

            if (course.time !== '') {
                const dayAndPeriodReg = /[一二三四五六日]|(?<=第)\d*/gm
                const isNotDayReg = /[^一二三四五六日]/gm

                course.time = course.time
                    .match(dayAndPeriodReg)
                    .filter((item, index, arr) => {
                        if (isNotDayReg.test(item)) return true;
        
                        return arr.indexOf(item) === index;
                    })
                    .join(' ')
            }

            course.location = course.location.match(/(?<=\()\w*/gm)
            course.location = [...new Set(course.location)].join('')

            course.language = course.language
                .filter((lang) => lang !== '')
                .map((lang) => lang.replace(/[^\u4E00-\u9FA5]/g, ''))
            
            for (const capKey in course.capacity) {
                for (const capSubValue in course.capacity[capKey]) {
                    course.capacity[capKey][capSubValue] = course.capacity[capKey][capSubValue].replace('人', '')

                    if (course.capacity[capKey][capSubValue].includes('不設限')) {
                        course.capacity[capKey][capSubValue] = 'Unlimited'
                    }
                }
            }
        })
    })
    
    return coursesData
}

export {
    processHistoryCoursesDetail
}