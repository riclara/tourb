import express from 'express'
import cors from 'cors'
import scrapeIt from 'scrape-it'

const app = express()
const port = process.env.PORT || 8000

app.use(cors())

function getDetails ({name, url}) {
  let param = {}
  param[name] = {
    listItem: '.element',
    data: {
      title: 'h4',
      desciption: 'p',
      image: {
        selector: 'img',
        attr: 'src'
      },
      url: {
        selector: '.tour_link',
        attr: 'href'
      }
    }
  }
  return scrapeIt(url, param)
}

app.get('/', async (request, response) => {
  scrapeIt('https://paramotrek.com', {
    tours: {
      listItem: '.ppb_tourcat_grid .element',
      data: {
        name: 'h3',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  }).then(({ data, resp }) => {
    let arrPromise = []
    data.tours.forEach(tour => {
      arrPromise.push(getDetails(tour))
    })
    Promise.all(arrPromise).then(responses => {
      const res = responses.reduce((curr, val) => {
        curr.push(val.data)
        return curr
      }, [])
      response.json(res)
    })
  }).catch(reason => response.status(500).json({error: reason}))
})

app.listen(port, (err) => {
  if (err) {
    return console.log('Error on load server: ', err)
  }
  console.log(`Server is running and listening on ${port}`)
})
