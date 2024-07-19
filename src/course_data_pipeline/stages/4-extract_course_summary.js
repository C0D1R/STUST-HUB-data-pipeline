const extractCoursesSummaries = (coursesData) => {
    return coursesData.map((department) => ({
        ...department,
        courses: department.courses.map((course) => ({
            code: course.code,
            name: course.name.zh,
            credit: course.credit,
            type: course.type,
            instructors: course.instructors,
            classes: course.classes,
            schedule: course.schedule,
        }))
    }))
}

export {
    extractCoursesSummaries
}