verificaLogado().then((isLoggedIn) => {
    if(!isLoggedIn) {
        logout()
    }
}).catch((error) => {
    console.error(error);
});