class sel {
    static semesterYear = '#ctl00_ContentPlaceHolder1_lab_year'
    static semester = '#ctl00_ContentPlaceHolder1_lab_semes'

    static deptSelect = '#ctl00_ContentPlaceHolder1_ddl_dept';
    static classSelect = '#ctl00_ContentPlaceHolder1_ddl_class';
    static typeSelect = '#ctl00_ContentPlaceHolder1_ddl_rs';

    static deptOptions = `${sel.deptSelect} > option:not([value=""])`;
    static classOptions = `${sel.classSelect} > option:not([value=""])`;
    static typeOptions = `${sel.typeSelect} > option:not([value=""]):not([value="*"])`;

    static submitButton = '#ctl00_ContentPlaceHolder1_btn_query';

    static courseTable = '#ctl00_ContentPlaceHolder1_gv_result';
    static courseLastTr = `${sel.courseTable} > tbody > tr:last-of-type`;
    static courseNoFoundTd = `${sel.courseTable} td[style="width:100%;"]`;
    static courseLinks = `${sel.courseTable} tr[style*="height:30px;"]:not(:first-of-type) a`;
    static coursePager = `${sel.courseTable} td[colspan="6"]`;
    static coursePagerLinks = `${sel.courseTable} td[colspan="6"] a`;
}

export { sel }