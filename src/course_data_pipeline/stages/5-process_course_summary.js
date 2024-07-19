const processCoursesSummaries = (coursesData) => {
    coursesData = JSON.parse(JSON.stringify(coursesData))

    coursesData.forEach((department) => {
        department.courses.forEach((course) => {
            course.credit = course.credit.replace(/\..*/gm, '').trim();

            course.instructors = course.instructors.split(',').map((instructor) => instructor.trim()).join('、')

            course.classes = course.classes.split(',').length > 1
                ? `${course.classes.split(',')[0].trim()}等合開`
                : course.classes

            course.schedule = course.schedule.reduce((acc, item, index) => {
                const day = item.day.replace('週', '')
                const period = item.period.replace(/\D/g, '')

                if (index === 0 || course.schedule[index - 1].day !== item.day) {
                    acc.push(day)
                }

                acc.push(period)

                return acc
            }, []).join(' ')
        })
    })
    
    return coursesData
}

export {
    processCoursesSummaries
}