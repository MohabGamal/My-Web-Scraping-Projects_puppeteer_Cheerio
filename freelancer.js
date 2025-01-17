const { default: axios } = require("axios")

const BASE_URL = "https://www.freelancer.com"

const convertFutureDate = async (relativeDate) => {
  const date = new Date()
  const timeParts = relativeDate.split(" ")
  const value = parseInt(timeParts[0])
  const unit = timeParts[1]

  if (unit === "days") date.setDate(date.getDate() + value)
  else if (unit === "months") date.setMonth(date.getMonth() + value)
  else if (unit === "years") date.setFullYear(date.getFullYear() - value)

  // ex. '8/27/2023'
  return date.toLocaleDateString()
}

const parseJobsData = async (job) => {
  const title = job?.project_name
  const description = job?.project_desc
  const seoUrl = job?.seo_url
  const budget = job?.budget_range
  const timeLeft = job?.time_left
  const bidAvg = job?.bid_avg
  const paymentVerified = job?.payment_verified
  const skills = job?.skills_info
  return {
    title,
    description,
    bidAvg,
    budget,
    deadline: convertFutureDate(timeLeft),
    date: new Date().toLocaleDateString(),
    link: `${BASE_URL}${seoUrl}`,
    paymentVerified: paymentVerified == "1" ? true : false,
    skills: skills?.map((skill) => skill?.name),
  }
}

// scrape using fetch api
const scrapeFreelance = async (searchQuery) => {
  // Original API:  https://www.freelancer.com/ajax/table/project_contest_datatable.php?tag=web&type=false&budget_min=false&budget_max=false&contest_budget_min=false&contest_budget_max=false&hourlyrate_min=false&hourlyrate_max=false&hourlyProjectDuration=false&skills_chosen=false&languages=false&status=open&vicinity=false&countries=false&lat=false&lon=false&iDisplayStart=50&iDisplayLength=50&iSortingCols=1&iSortCol_0=6&sSortDir_0=desc&format_version=3&
  const apiUri = new URL(`${BASE_URL}/ajax/table/project_contest_datatable.php`)
  apiUri.searchParams.append("tag", searchQuery)
  apiUri.searchParams.append("iDisplayStart", 0)
  apiUri.searchParams.append("iDisplayLength", 1e6)
  apiUri.searchParams.append("iSortCol_0", 6)
  apiUri.searchParams.append("sSortDir_0", "desc")
  apiUri.searchParams.append("format_version", 3)
  apiUri.searchParams.append("status", "open") // `all` to get all jobs in the database
  const res = await axios.get(apiUri.href)
  const jobs = res?.data?.aaData?.map(parseJobsData)
  return jobs
}

module.exports = scrapeFreelance

/** scrape using puppeteer
  
const slugify = require("slugify")

const SELECTORS = {
  div: ".JobSearchCard-item",
  title: ".JobSearchCard-primary-heading-link",
  budget: ".JobSearchCard-secondary-price",
  description: ".JobSearchCard-primary-description",
  tags: ".JobSearchCard-primary-tags > a",
  deadline: ".JobSearchCard-primary-heading-days",
}

async function scrapePage(jobsDiv, SELECTORS) {
  // browser function ('use client') :D 
  const jobsData = jobsDiv.map(async (job) => {
    const relativeLink = job.querySelector(SELECTORS.title).href
    const title = job.querySelector(SELECTORS.title).innerText
    const description = job.querySelector(SELECTORS.description).innerText
    const relativeDeadline = job.querySelector(SELECTORS.deadline).innerText
    const budget = job
      .querySelector(SELECTORS.budget)
      ?.textContent?.trim()
      ?.split("\n")[0]
    // Array.from() to convert NodeList to Array because map() is not a function on NodeList datatype
    const tags = Array.from(job.querySelectorAll(SELECTORS.tags)).map(
      (tag) => tag.innerText
    )
    return {
      title,
      budget,
      description,
      tags,
      date: new Date().toLocaleDateString(),
      deadline: await browserConvertFutureDate(relativeDeadline),
      link: `https://www.freelancer.com${relativeLink}`,
    }
  })
  return await Promise.all(jobsData)
}

async function scrapeFreelance(page, searchQuery) {
  const url = new URL("https://www.freelancer.com/jobs/" + slugify(searchQuery))

  try {
    await page.exposeFunction("browserConvertFutureDate", convertFutureDate)
    await page.goto(url.href, {
      waitUntil: "networkidle2",
    })
    await page.waitForSelector(SELECTORS.div)
    const jobs = await page.$$eval(SELECTORS.div, scrapePage, SELECTORS)
    return jobs
  } catch (error) {
    console.error(error)
  }
  page.close()
}
**/
