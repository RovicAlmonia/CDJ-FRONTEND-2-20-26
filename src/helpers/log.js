import { useContext } from "react"
import { http } from "../api/http"
import { AuthContext } from "../modules/context/AuthContext"

export default function log () {
    const {accessToken} = useContext(AuthContext)

    const test = (data) => {
        const dataVariable = {
                event: "test",
                doctype: data.doctype,
                referenceno: data.referenceno,
                remarks: data.remarks,
                loggedby: accessToken.userID
            }
        
            console.log(dataVariable)
    }
    
    const insert = async(data) => {
        const response = await http.post('/log', {
            dataVariable:{
                event: "insert",
                doctype: data.doctype,
                referenceno: data.referenceno,
                remarks: data.remarks,
                loggedby: accessToken.userID
            }
        })

        return response.status
    }

    const update = async(data) => {
        const response = await http.post('/log', {
            dataVariable:{
                event: "update",
                doctype: data.doctype,
                referenceno: data.referenceno,
                remarks: data.remarks,
                loggedby: accessToken.userID
            }
        })

        return response.status
    }

    const remove = async(data) => {
        const response = await http.post('/log', {
            dataVariable:{
                event: "delete",
                doctype: data.doctype,
                referenceno: data.referenceno,
                remarks: data.remarks,
                loggedby: accessToken.userID
            }
        })

        return response.status
    }


    const approved = async(data) => {
        const response = await http.post('/log', {
            dataVariable:{
                event: "approval",
                doctype: data.doctype,
                referenceno: data.referenceno,
                remarks: data.remarks,
                loggedby: accessToken.userID
            }
        })

        return response.status
    }

    const pending = async(data) => {
        const response = await http.post('/log', {
            dataVariable:{
                event: "pending",
                doctype: data.doctype,
                referenceno: data.referenceno,
                remarks: data.remarks,
                loggedby: accessToken.userID
            }
        })

        return response.status
    }

    return {test, insert, update, remove, approved, pending}


} 