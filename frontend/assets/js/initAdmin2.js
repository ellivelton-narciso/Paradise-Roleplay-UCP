$.ajax({
    url: `${url}/isadmin`,
    method: "GET",
    headers: {
        "Authorization": `Bearer ${getCookie('tk')}`
    },
    success: res => {
        if (!res.isAdmin || res.isAdmin < 2) {
            location.assign('index.html')
        }
    },
    error: ()=> {
        logout()
    }
})