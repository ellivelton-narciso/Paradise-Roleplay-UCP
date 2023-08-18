$.ajax({
    url: `${url}/isadmin`,
    method: "GET",
    headers: {
        "Authorization": `Bearer ${getCookie('tk')}`
    },
    success: res => {
        if (!res.isAdmin) {
            location.assign('index.html')
        }
    },
    error: ()=> {
        logout()
    }
})