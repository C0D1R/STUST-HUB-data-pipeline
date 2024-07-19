class sel {
    static searchForm = '#form1 > div:nth-child(11) > div:nth-child(3) > table:nth-child(3) > tbody > tr > td:nth-child(1) > table'
    static searchSelect = {
        semester: '#ContentPlaceHolder1_ddl_semes',
        department: '#ContentPlaceHolder1_ddl_dept',
        class: '#ContentPlaceHolder1_ddl_class',
        courseType: '#ContentPlaceHolder1_ddl_rs'
    }
    static searchSelectOption = {
        semester: `${sel.searchSelect.semester} > option:not([value=""])`,
        department: `${sel.searchSelect.department} > option:not([value=""])`,
        class: `${sel.searchSelect.class} > option:not([value=""])`,
        courseType: `${sel.searchSelect.courseType} > option:not([value=""])`
    }
    static searchButton = '#ContentPlaceHolder1_btn_search'

    static courseTable = '#ContentPlaceHolder1_gv_course'
    static courseTableData = {
        noData: `${sel.courseTable} > tbody > tr > td[colspan="6"]`,
        subcodes: `${sel.courseTable} > tbody > tr > td:nth-of-type(1) > span`
    }
}

export { sel }