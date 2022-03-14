const axios = require('axios')

const createRequests = (numberOfRequests, url) => {
  const request = () => {
    const promise = new Promise((resolve, reject) => {
        axios
        .get(url)
        .then(res => {
          resolve(res)
        })
        .catch(err => reject(err))
    })
    return promise
  }

  return [...Array(numberOfRequests).keys()].map(elem => request(elem))
}

const evaluateSettledResponses = (settledResponses, tests) => {
  const results = {
    totalRequests: settledResponses.length,
    matchedData: 0,
    matchedStatus: 0,
  }

  settledResponses.forEach(res => {
    if (tests.matchStatus === res.value.status) {
      results.matchedStatus++
    }

    if (tests.matchDataStrings.includes(res.value.data)) {
      results.matchedData++
    }
  })
  return results
}

const testCanary = async (numberOfRequests, url, tests) => {
  /* EXAMPLE TEST
    - make 50 HTTP requests to URL provided by user
    - for each response, log if status code is 200
    - test actual response data vs. user provided expected response data 
  */
  const requests = createRequests(numberOfRequests, url)  
  Promise.allSettled(requests)
    .then(settledResponses => {
      const evaluatedResults = evaluateSettledResponses(settledResponses, tests)
      console.log(evaluatedResults)
      return evaluatedResults
    })
    .catch(err => {
      console.log(err)
      return err
    })  
}

module.exports = testCanary