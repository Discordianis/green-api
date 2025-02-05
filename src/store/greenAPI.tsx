import {makeAutoObservable} from "mobx";

interface IGreen {
    authStatus: string,
    idInstance: string,
    apiTokenInstance: string,
}

class Green {
    authStatus = ''
    idInstance = ''
    apiTokenInstance = ''
    constructor() {
        makeAutoObservable(this)
    }
    getGreenAPI() {
        const greenAPI = localStorage.getItem('greenAPI')
        let data: IGreen | null = null
        if (greenAPI) {
            data = JSON.parse(greenAPI)
        }
        if (data) {
            this.authStatus = data.authStatus
            this.idInstance = data.idInstance
            this.apiTokenInstance = data.apiTokenInstance
        }
    }
    updateGreenAPI(authStatus: string, idInstance: string, apiTokenInstance: string) {
        this.authStatus = authStatus
        this.idInstance = idInstance
        this.apiTokenInstance = apiTokenInstance
    }
    removeGreenAPI() {
        this.authStatus = ''
        this.idInstance = ''
        this.apiTokenInstance = ''
    }
}
const GreenAPI = new Green()
export default GreenAPI