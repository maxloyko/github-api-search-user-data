import React, {useState, useEffect, createContext} from 'react';
// import mockUser from './mockData.js/mockUser';
// import mockRepos from './mockData.js/mockRepos';
// import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = createContext();

const GithubProvider = ({children}) => {
    const [githubUser, setGithubUser] = useState({})
    const [repos, setRepos] = useState([])
    const [followers, setFollowers] = useState([])

    //request loading
    const [request, setRequest] = useState(0)
    const [loading, setLoading] = useState(false)
    //error
    const [error, setError] = useState({show: false, msg: ''})

    const searchGithubUser = async (user) => {
        toggleError()
        setLoading(true)
        const response = await axios(`${rootUrl}/users/${user}`).catch(e => console.log(e))
        if (response) {
            setGithubUser(response.data);
            const {login, followers_url} = response.data

            await Promise.allSettled([axios(`${rootUrl}/users/${login}/repos?per_page=100`), axios(`${followers_url}?per_page=100`)])
                .then((results) => {
                    const [repos, followers] = results
                    const status = 'fulfilled'
                    if (repos.status === status) {
                        setRepos(repos.value.data)
                    }
                    if (followers.status === status) {
                        setFollowers(followers.value.data)
                    }
                })
        } else {
            toggleError(true, 'there is no user with that username')
        }
        checkRequests()
        setLoading(false);
    }
    //check rate
    const checkRequests = () => {
        axios(`${rootUrl}/rate_limit`).then((response) => {
            let {rate: {remaining}} = response.data
            setRequest(remaining)
            if (remaining === 0) {
                toggleError(true, 'sorry, have exceeded your hourly rate limit! ')
            }
        }).catch((err) => console.log(err))
    }

    // useEffect(checkRequests, [])
    function toggleError(show = false, msg = '') {
        setError({show, msg})
    }

    useEffect(() => {
        checkRequests()

    }, [])
    return <GithubContext.Provider
        value={{githubUser, repos, followers, request, error, searchGithubUser, loading}}>{children}
    </GithubContext.Provider>
}

export {GithubContext, GithubProvider}