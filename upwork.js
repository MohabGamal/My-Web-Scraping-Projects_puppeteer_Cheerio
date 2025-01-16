const { default: slugify } = require("slugify")

const UPWORK_URL = "https://www.upwork.com/"
const SELECTORS = {
  parentDiv: "[data-test='job-tile-list']",
  div: "section.up-card-section.up-card-list-section",
  title: "h3",
  link: "h3 > a",
  description: ".up-line-clamp-v2",
  duration: "[data-test='duration']",
  date: "[data-test='posted-on']",
  experience: "[data-test='contractor-tier']",
  type: "[data-test='job-type']",
  budget: "[data-test='budget']",
  tags: ".up-skill-wrapper > a",
  lastPageButtonDisabled:
    "li:last-child .up-pagination-item.skip-to.up-btn.up-btn-link.disabled",
  nextPageButton: ".next-icon.up-icon",
}

const parseJobsData = async (job) => {
  const title = job?.title
  const description = job?.description
  const publishedOn = job?.publishedOn
  const duration = job?.duration
  const tier = job?.tier
  const freelancersToHire = job?.freelancersToHire
  const amount = job?.amount
  const weeklyBudget = job?.weeklyBudget
  const hourlyBudget = job?.hourlyBudget
  const ciphertext = job?.ciphertext
  const categories = job?.attrs?.map((category) => category?.prettyName)

  const slug = title ? slugify(title) : null
  const link =
    title && ciphertext && slug
      ? `https://www.upwork.com/freelance-jobs/apply/${slug}_${ciphertext}`
      : null
  return {
    title,
    description,
    publishedOn,
    duration,
    tier,
    freelancersToHire,
    amount,
    weeklyBudget,
    hourlyBudget,
    link,
    categories,
  }
}

// scrape all jobs with fetch api in the browser
async function scrapeUpwork({ page, searchQuery }) {
  
  const upworkUrl = new URL(`${UPWORK_URL}/nx/jobs/search/`)
  upworkUrl.searchParams.set("q", searchQuery)

  const upworkApiUrl = new URL(`${UPWORK_URL}search/jobs/url`)
  upworkApiUrl.searchParams.set("q", searchQuery)
  upworkApiUrl.searchParams.set("sort", "recency")
  upworkApiUrl.searchParams.set("per_page", "100000")

  // load the page with 1 job then fetch all jobs with fetch api (faster)
  await page.evaluateOnNewDocument(
    () => localStorage.setItem("jobs_per_page", "1") // default is 10
  )

  let upworkHeaders
  page.on("request", async (req) => {
    if (req.url().startsWith(`${UPWORK_URL}search/jobs/url`)) {
      upworkHeaders = req.headers()
    }
  })

  await page.goto(upworkUrl.href)

  const jobs = await page.evaluate(async (upworkHeaders) => {
    try {
      const res = await fetch(upworkApiUrl.href, {
        headers: upworkHeaders,
      })
      const resJson = await res.json()
      const resJobs = resJson?.searchResults?.jobs
      return resJobs
    } catch (error) {
      console.error(error)
      return []
    }
  }, upworkHeaders)
  page.close()

  const parsedJobs = await Promise.all(jobs?.map(parseJobsData))
  return parsedJobs
}

/* // scrape using puppeteer page requests
const scrapeUpwork = async (page, searchQuery) => {
  const optimizedQuery = searchQuery.trim().replace(/\s+/g, " ") // remove extra spaces
  const upworkUrl = new URL(`${BASE_URL}nx/jobs/search/`)
  upworkUrl.searchParams.set("q", optimizedQuery)
  upworkUrl.searchParams.set("sort", "recency")
  // upworkUrl.searchParams.set("page", "37")
  let jobs = []

  await Promise.all([
    // adds a JS code to the page that will run on every page load
    page.evaluateOnNewDocument(
      () => localStorage.setItem("jobs_per_page", 50) // default is 10, max 50
    ),
    page.setRequestInterception(true),
  ])

  // abort all requests for images, stylesheets, and media
  page.on("request", async (req) => {
    const resourseType = req.resourceType()
    if (
      resourseType == "image" ||
      resourseType == "stylesheet" ||
      resourseType == "media"
    )
      req.abort()
    else req.continue()
  })

  // listen to the API responses of the page
  page.on("response", async (res) => {
    if (res.url().startsWith(`${BASE_URL}search/jobs/url`)) {
      const resJson = await res?.json()
      const resJobs = resJson?.searchResults?.jobs?.map(parseJobsData)
      jobs.push(...resJobs)
    }
  })

  await page.goto(upworkUrl.href, {
    waitUntil: "networkidle2",
  })

  while (true) {
    const jobsContainer = await page.$(SELECTORS.parentDiv)
    if (!jobsContainer) break
    const lastPageButtonDisabled = await page.$(
      SELECTORS.lastPageButtonDisabled
    )
    if (lastPageButtonDisabled) break
    await Promise.all([
      page.click(SELECTORS.nextPageButton),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ])
  }
  page.close()
  return jobs
}
*/

/* // scraping the page from the dom

function convertPastDate(relativeDate) {
  const date = new Date()
  const timeParts = relativeDate.split(" ")
  const value = parseInt(timeParts[0])
  const unit = timeParts[1]

  if (unit === "days") date.setDate(date.getDate() - value)
  else if (unit === "months") date.setMonth(date.getMonth() - value)
  else if (unit === "years") date.setFullYear(date.getFullYear() - value)

  // ex. '8/27/2023'
  return date.toLocaleDateString()
}

async function scrapePage(jobsDiv, SELECTORS) {
  // browser function ('use client') :D 
  const jobsData = jobsDiv.map(async (jobDiv) => {
    const title = jobDiv.querySelector(SELECTORS.title).innerText
    const description = jobDiv.querySelector(SELECTORS.description).innerText
    const duration = jobDiv.querySelector(SELECTORS.duration)?.innerText
    const relativeDate = jobDiv.querySelector(SELECTORS.date).innerText
    const experience = jobDiv.querySelector(SELECTORS.experience).innerText
    const type = jobDiv.querySelector(SELECTORS.type).innerText
    const relativeLink = jobDiv.querySelector(SELECTORS.link).href
    const budget =
      type === "Fixed-price"
        ? jobDiv.querySelector(SELECTORS.budget).innerText
        : type
    // Array.from() to convert NodeList to Array because map() is not a function on NodeList datatype
    const tags = Array.from(jobDiv.querySelectorAll(SELECTORS.tags)).map(
      (category) => category.innerText
    )

    return {
      title,
      description,
      budget,
      experience,
      duration,
      tags,
      relativeDate,
      date: await browserConvertPastDate(relativeDate),
      link: `https://www.upwork.com${relativeLink}`,
    }
  })
  return await Promise.all(jobsData)
}

async function scrapeUpwork(page, searchQuery) {
  const BASE_URL = "https://www.upwork.com/nx/"
  const optimizedQuery = searchQuery.trim().replace(/\s+/g, " ") // remove extra spaces
  const upworkUrl = new URL(BASE_URL + "jobs/search/")
  upworkUrl.searchParams.set("q", optimizedQuery)
  upworkUrl.searchParams.set("sort", "recency")
  // upworkUrl.searchParams.set("page", "37")
  let jobs = []

  await page.exposeFunction("browserConvertPastDate", convertPastDate)
  // adds a JS code to the page that will run on every page load
  await page.evaluateOnNewDocument(() => {
    // default is 10
    localStorage.setItem("jobs_per_page", 50)
  })
  await page.goto(upworkUrl.href, {
    waitUntil: "networkidle2",
  })

  while (true) {
    const jobsContainer = await page.$(SELECTORS.parentDiv)
    if (!jobsContainer) break

    await page.waitForSelector(SELECTORS.div)
    const newJobs = await page.$$eval(SELECTORS.div, scrapePage, SELECTORS)
    jobs = jobs.concat(newJobs)

    const lastPageButtonDisabled = await page.$(
      SELECTORS.lastPageButtonDisabled
    )
    if (lastPageButtonDisabled) break
    await Promise.all([
      page.click(SELECTORS.nextPageButton),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ])
  }
  page.close()
  return jobs
}
*/

module.exports = scrapeUpwork
