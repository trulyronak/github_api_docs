const axios = require("axios")
const API_URL = "https://api.github.com"
const PROXY_URL = "http://localhost:5000"

function fillInGaps(url) {
    console.log(url)
    // general rule — if there is a '{' or '}' — don't make the request, it's invalid
    /* examples:
     * {org}
     * {repository_id}
     * {query}
     * {/owner}
     * {/repo}
     * {/gist_id}
     * {/target}
     * {/client_id}
     * {?type,page,per_page,sort}
     * {&page,per_page,sort,order}"
     * {&page,per_page}"
    */
    const mappings = {
        path: { /* required to visit this option */
            org: "opticdev",
            repository_id: "",
            query: "",
        },
        slashPaths: { /* optional to visit this option */
            owner: "trulyronak",
            repo: "optic",
            gist_id: "c02b171a6d6812d0a10d5833c173abb7",
            target: "trulyronak",
            client_id: ""
        },
        query: { /**additional options */
            type: "",
            page: "",
            per_page: "",
            sort: "",
        }
    }
    let newURL = ""
    for (let j = 0; j < url.length; j++) {
        if (url[j] === '{') {
            // fill in this gap
            let end = j + 1;
            for (end = j + 1; end < url.length; end++) {
                if (url[end] === '}') {
                    break
                }
            }

            let option = url.substring(j + 1, end)
            debugger
            if (option[0] === "?" || option[0] === "&") {
                if (option.includes(",")) {}
                else {
                    newURL += `${option[0]}${mappings.query[option.substring(1)]}`
                }
            } else if (option[0] === "/") {
                if (option.includes(",")) {}
                else {
                    if (!mappings.slashPaths[option.substring(1)]) { continue; }
                    newURL += `${option[0]}${mappings.slashPaths[option.substring(1)]}`
                }
                
            } else {
                if (option.includes(",")) {}
                else {
                    if (!mappings.path[option]) { continue; }
                    newURL += `${mappings.path[option]}`
                }

            }
            j = end
        } else {
            newURL += url[j]
        }
    }
    if (newURL.includes("{") || newURL.includes("}")) { return null}
    return newURL
}

function tree(url) {
    console.log(`Treeing off @ ${url}`)
    url = fillInGaps(url)

    if (url === null) { return; }
    // attempt to not get timed out
    setTimeout(() => {
        axios.get(url, {headers: {Authorization: `token ${process.env.OAUTH_TOKEN}`}}).then(response => {
            investigate(response.data)
        }).catch(err => {
            console.log(err)
        })
    }, 1000)
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

// fillInGaps(process.argv[2] || "https://api.github.com/users/trulyronak/starred{/owner}{/repo}")
tree(`${PROXY_URL}/repos/opticdev/optic/issues`);
// console.log({headers: {Authorization: `token ${process.env.OAUTH_TOKEN}`}})