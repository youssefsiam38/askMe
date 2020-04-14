const errorHandler = (e) => {
    if(e.status && e.errMsg) return e
    
    if(e.errors){
        for(let key in e.errors){
            return { errMsg: e.errors[key].reason, status: 400 }
        }
    }
    // check if the error is duplicating error (for username or email)
    if(e.code === 11000){

        // filtering the big bad mongodb message
        const duplicatedItem = e.errmsg.split('index: ')[1].split(' dup key')[0].replace('_1', '')

        const errMsg = `This ${duplicatedItem} is in use, Kindly login using another one`
        return { errMsg , status: 400 }
    }
    
        return { errMsg: e, status: 500 }
}

module.exports = errorHandler