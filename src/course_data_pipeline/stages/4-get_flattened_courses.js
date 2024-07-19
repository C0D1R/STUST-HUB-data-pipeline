const getFlattenedCourses = (coursesGroupedMapped, coursesGroupedUnmapped) => {
    const processCourses = new Set() 
    const flattenedCourses = []
    
    coursesGroupedMapped.forEach((department) => {
        department.courses.forEach((course) => {
            if (!processCourses.has(course.code)) {
                processCourses.add(course.code)
                flattenedCourses.push(course)
            }
        })
    })

    coursesGroupedUnmapped.forEach((department) => {
        department.courses.forEach((course) => {
            if (!processCourses.has(course.code)) {
                processCourses.add(course.code)
                flattenedCourses.push(course)
            }
        })
    })

    return flattenedCourses
}

export {
    getFlattenedCourses
}