const getDepartmentCode = (chineseName) => {
    const departmentMap = {
        "工管系": "imi",
        "國企系": "ib",
        "財金系": "fin",
        "企管系": "ba",
        "資管系": "mis",
        "會資系": "accinfo",
        "休閒系": "leisure",
        "行流系": "mim",
        "餐旅系": "hm",
        "電機系": "ee",
        "機械系": "mech",
        "電子系": "eecs",
        "半導體系": "oe",
        "資工系": "csie",
        "化材系": "chem",
        "食品系": "bio",
        "資傳系": "ic",
        "視傳系": "vc",
        "多樂系": "mes",
        "產設系": "cpd",
        "流音系": "pmi",
        "應英系": "english",
        "應日系": "japan",
        "幼保系": "childcare",
        "高福系": "ss"
    }

    return departmentMap[chineseName] || null
}

const mapCoursesDept = (coursesData) => {
    coursesData = JSON.parse(JSON.stringify(coursesData))
    
    const courses = {
        mapped: [],
        unmapped: []
    }

    coursesData.departments.forEach((dept) => {
        const deptId = getDepartmentCode(dept.id)

        if (deptId) {
            dept.id = `${coursesData.semester}_${deptId}`
            courses.mapped.push(dept)
        } else {
            dept.id = `${coursesData.semester}_${dept.id}`
            courses.unmapped.push(dept)
        }
    })

    return courses
}

export {
    mapCoursesDept
}