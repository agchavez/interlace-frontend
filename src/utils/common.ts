export const regextEmail = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const getM = (m: number) => {
    const mon = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
    const res = mon[m]
    return res || ""
}

export const formatDate = (d: Date) => {
    return `${appendLeftZeros(d.getDate(), 2)}-${getM(d.getMonth())}-${d.getFullYear()}`
}

export const formatTime = (d: Date) => {
    return `${appendLeftZeros(d.getHours(), 2)}:${appendLeftZeros(d.getMinutes(), 2)}:${appendLeftZeros(d.getSeconds(), 2)}`
}

export const appendLeftZeros = (n: number, length: number):string => {
    let track = n.toString();
    for (let i = track.length; track.length<length; i++) {
        track = "0" + track
    }
    return track;
}