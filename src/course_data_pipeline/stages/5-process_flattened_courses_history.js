const processHistoryFlattenedCourses = (coursesData) => {
    coursesData = JSON.parse(JSON.stringify(coursesData))

    coursesData.forEach((course) => {
        course.credit = course.credit.replace(/\..*/gm, '').trim();
        
        course.classes = course.classes.split(',').map((classValue) => classValue.trim())

        course.instructors = course.instructors.split(',').map((instructor) => instructor.trim())

        course.schedule.forEach((item) => {
            item.day = item.day.replace('週', '').trim()
            item.period = item.period.replace(/\D/gm, '').trim()
        })

        course.languages = course.languages
            .filter((language) => language !== '')
            .map((language) => language.replace(/[\d\.]/gm, '').trim())

        course.certificationsSupport = course.certificationsSupport
            .filter((support) => !support.includes('無') && support !== '')
            .map((support) => support.replace(/[\d\.]/gm, '').trim())

        if (course.prerequisites === '無' || course.prerequisites === '無。') course.prerequisites = ''
        if (course.referenceBooks === '無' || course.referenceBooks === '無。') course.referenceBooks = ''
        if (course.teachingSoftware === '無' || course.teachingSoftware === '無。') course.teachingSoftware = ''

        if (course.exams.other === '--') course.exams.other = ''

        course.teachingAndAssessment.forEach((item) => {
            item.teachingMethods = item.teachingMethods.filter((method) => method !== '--')
            item.assessmentMethods.forEach((assessmentItem) => {
                if (assessmentItem.method === '--') assessmentItem.method = ''
            })
        })
    })

    return coursesData
}

export {
    processHistoryFlattenedCourses
}