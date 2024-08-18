import { ACCESS_TOKEN, LANGUAGE, PERMISSIONS, ROLE_CODE, USER_EMAIL, USER_ID, USER_NAME } from './Constant';

function setLocalStorage( name:string , data:string ):void{
    if( localStorage != null ){
        localStorage.setItem(name, data)
    }
}

function getLocalStorage( name:string ):string|null{
    let value:string | null = ""
    if( localStorage != null ){
         value = localStorage.getItem(name)
    }
    return value
}

function initStorage(){
    localStorage.setItem(ACCESS_TOKEN, '')
    localStorage.setItem(USER_NAME, '')
    localStorage.setItem(PERMISSIONS, '')
    localStorage.setItem(USER_ID, '')
    localStorage.setItem(USER_EMAIL, '')
    localStorage.setItem(LANGUAGE, "en-US")
    localStorage.setItem(ROLE_CODE, '')
}


export default {
    setLocalStorage,
    getLocalStorage,
    initStorage
}