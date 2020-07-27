const axios = require("axios")
const API_URL = "https://api.github.com"
const PROXY_URL = "http://localhost:5000"

function fillInGaps(url) {
    const mappings = {
        "collaborator": 3
    }
}

function tree(url) {
    console.log(`Treeing off @ ${url}`)
    // url = fillInGaps(url)
    
    axios.get(url, {headers: {Authorization: `token ${process.env.OAUTH_TOKEN}`}}).then(response => {
        investigate(response.data)
    }).catch(err => {
        console.log(err)
    })
}

function investigate(data) {
    if (data instanceof Array) {
        for (const item of data) {
            investigate(item)
        }
    } else if (data instanceof Object) {
        for (const property in data) {
            investigate(data[property])
        }
    } else if (typeof data === "string") {
        if (data.includes(API_URL)) {
            tree(data.replace(API_URL, PROXY_URL))
        }
    }
}

tree(`${PROXY_URL}/repos/opticdev/optic/issues`);
// console.log({headers: {Authorization: `token ${process.env.OAUTH_TOKEN}`}})