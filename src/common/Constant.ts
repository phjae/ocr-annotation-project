export const BRAND_NAME = "greenolive"
export const ACCESS_TOKEN = "accessToken"
export const USER_NAME = "userName"
export const USER_ID = "userId"
export const USER_EMAIL = "userEmail"
export const PERMISSIONS = "permissions"
export const LANGUAGE = "language"
export const ROLE_CODE = "roleCode"

export const MESSAGE = {
    "ERROR": "오류가 발생하였습니다. 관리자에게 문의 하세요."
    , "LOGIN_FAil": "로그인에 실패하였습니다."
    , "LOGIN_EXPIRED": "로그인 정보가 만료되었습니다."
    , "AUTHENTICATION_FAIL": "인증에 실패하였습니다. 관리자에게 문의 하세요."
    , "LOGOUT": "로그아웃 되었습니다."
    , "DELETE_USER" : "계정 삭제가 완료되었습니다"
}

export const LOGIN_TYPE = {
    "LOGOUT": "logout"
    , "EXPIRED": "expired"
    , "DELETE_USER" : "deleteUser"
}

export const DATE_FORMAT = {
    "DAY":"YYYY-MM-DD",
    "DAY_DOT":"YY.MM.DD",
    "DATE_TIME":"YYYY-MM-DD HH:mm:ss",
    "DATE_TIME_UTC":"YYYY-MM-DDTHH:mm:ss"
}

export const ACCESS_TYPE = {
    "EXECUTE": "X",
    "REGISTER": "C",
    "UPDATE": "E",
    "DELETE": "D",
    "SELECT": "R"
}

export const ENUMS = [
    {type: "USER_ROLE", code: "ADMIN", codeDetail: "CONSTANT.USER_ROLE.ADMIN"},
    {type: "USER_ROLE", code: "MANAGER", codeDetail: "CONSTANT.USER_ROLE.MANAGER"},
    {type: "USER_ROLE", code: "USER", codeDetail: "CONSTANT.USER_ROLE.USER"},

    {type: "USER_STATUS", code: "A", codeDetail: "CONSTANT.USER_STATUS.ACTIVE"},
    {type: "USER_STATUS", code: "S", codeDetail: "CONSTANT.USER_STATUS.STOP"},
    {type: "USER_STATUS", code: "L", codeDetail: "CONSTANT.USER_STATUS.LOCK"},
    // {type: "USER_STATUS", code: "R", codeDetail: "CONSTANT.USER_STATUS.WITHDRAWAL"},


    {type: "GPU_GENERATE_METHOD", code: "NASNet", codeDetail: "NASNet", category: "PG"},
    {type: "GPU_GENERATE_METHOD", code: "DARTS", codeDetail: "DARTS", category: "PG"},
    {type: "GPU_GENERATE_METHOD", code: "Custom", codeDetail: "Custom", category: "CG"},

    {type: "PUBLISHER", code: "MC", codeDetail: "해병대" },
    {type: "PUBLISHER", code: "NAVY", codeDetail: "해군"},

    {type: "CONTENT_TYPE", code: "MANUAL", codeDetail: "교범" },
    {type: "CONTENT_TYPE", code: "GUIDE", codeDetail: "교수안"},
    {type: "CONTENT_TYPE", code: "CBT", codeDetail: "CBT교육자료"},
    {type: "CONTENT_TYPE", code: "EVALUATION", codeDetail: "평가문제"},
    {type: "CONTENT_TYPE", code: "QNA", codeDetail: "산물생성양식"},

    {type: "DOCUMENT_TYPE", code: "HWP", codeDetail: "HWP"},
    {type: "DOCUMENT_TYPE", code: "PDF", codeDetail: "PDF"},
    {type: "DOCUMENT_TYPE", code: "WORD", codeDetail: "WORD"},

    {type: "SHAPE_TYPE", code: "COMMENTARY", codeDetail: "주석"},
    {type: "SHAPE_TYPE", code: "TABLE", codeDetail: "표"},
    {type: "SHAPE_TYPE", code: "IMAGE", codeDetail: "이미지"},
    {type: "SHAPE_TYPE", code: "CONTENT", codeDetail: "콘텐트내용"},


    {type: "FILE_SIZE_TYPE", code: "KB", codeDetail: "KB"},
    {type: "FILE_SIZE_TYPE", code: "MB", codeDetail: "MB"},
    {type: "FILE_SIZE_TYPE", code: "GB", codeDetail: "GB"},

    {type: "TASK_STATUS", code: "READY", codeDetail: "준비"},
    {type: "TASK_STATUS", code: "ANNOTATION", codeDetail: "진행중"},
    {type: "TASK_STATUS", code: "REVIEW", codeDetail: "검수요청"},
    {type: "TASK_STATUS", code: "COMPLETE", codeDetail: "검수완료"},

    {type: "DOCUMENT_CLASS", code: "HR", codeDetail:"인사"},

]

export const getDetailByCode = (type: string, code: string) => {
    return ENUMS.filter( i => i.type === type && i.code === code)[0]?.codeDetail
}

export const getCodeByDetail = (type: string, codeDetail: string) => {
    return ENUMS.filter( i => i.type === type && i.codeDetail === codeDetail)[0]?.code
}

export const getCodeListForSearch = (_type: string) => {
    const typeList = [{label: "options.all", id: ""}]
    ENUMS.filter( i => i.type === _type).forEach( j => {
        typeList.push({
            label: j.codeDetail,
            id: j.code
        })
    })
    return typeList
}

export const getCodeListForInsert = (_type: string) => {
    const typeList:string[] = []
    ENUMS.filter( i => i.type === _type).forEach( j => {
        typeList.push(j.codeDetail)
    })
    return typeList
}

export const getCodeListForInput = (_type: string) => {
    const typeList:{label:string, id:string}[] = []
    ENUMS.filter( i => i.type === _type).forEach( j => {
        typeList.push({
            label: j.codeDetail,
            id: j.code
        })
    })
    return typeList
}

export const getCodeListForChange = (_type: string) => {
    const typeList = [{label: "options.nothing", id: ""}]
    ENUMS.filter( i => i.type === _type).forEach( j => {
        typeList.push({
            label: j.codeDetail,
            id: j.code
        })
    })
    return typeList
}


export const getCodeListForInputByCategory = (_type: string, _category: string) => {
    const typeList:{label:string, id:string}[] = []
    ENUMS.filter( i => (i.type === _type)&&(i.category === _category) ).forEach( j => {
        typeList.push({
            label: j.codeDetail,
            id: j.code
        })
    })
    return typeList
}

export const RESERVATION_TYPE = {
    USING: "U",
    PENDING: "P",
    AUTOCOMPLETE: "A",
    MANUAL_COMPLETE: "M"
} as const

export const SSE = {
    ALARM: "alarm",
    NOTICE: "notice",
    ACTIVITY: "activity",
    TEST_EXECUTION: "testExecution",
    TEST_EXECUTION_HIST: "testExecutionHist",
    SEARCH_NEW_DUT:"newDUTData",
    MODEL_GEN_HIST: "modelGenerateHist",
    MODEL_GEN_FINISH: "modelGenerateFinish"
}

export const CONTENT_TYPE = {
    MANUAL: 'MANUAL',
    GUIDE: 'GUIDE',
    CBT: 'CBT',
    EVALUATION: 'EVALUATION',
    QNA: 'QNA',
}

export const ENTRIES = ["10", "25", "50", "100"]

export const TASK_STATUS = {
    READY: 'READY',
    ANNOTATION: 'ANNOTATION',
    REVIEW: 'REVIEW',
    COMPLETE: 'COMPLETE',
}