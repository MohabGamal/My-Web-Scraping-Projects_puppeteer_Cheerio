const puppeteer = require("puppeteer")
const fs = require("fs/promises")
const scrapeUpwork = require("./upwork.js")
const scrapeFreelancer = require("./freelancer.js")
const { default: axios } = require("axios")

//  hacks to evade bot detection
// page.removeAllListeners()
// await page.setJavaScriptEnabled(false)
// if (req.resourceType() === "script") req.abort()

const main = async () => {
  const searchQuery = "web scraping".trim().replace(/\s+/g, " ") // remove extra spaces

  const browser = await puppeteer.launch({
    defaultViewport: null,
    // headless: false,
    headless: "new",
  })
  const upworkPage = await browser.newPage()

  const [freelancerJobs, upworkJobs] = await Promise.all([
    scrapeFreelancer(searchQuery),
    scrapeUpwork({ upworkPage, searchQuery }),
  ])

  await Promise.all([
    fs.writeFile(
      "freelancerJobs.json",
      JSON.stringify(freelancerJobs, null, 2)
    ),
    fs.writeFile("upworkJobs.json", JSON.stringify(upworkJobs, null, 2)),
  ])

  browser.close()
}

// main().catch(console.error)

const test = async () => {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    headless: false,
    // headless: "new",
  })
  const searchQuery = "web scraping".trim().replace(/\s+/g, " ") // remove extra spaces
  const page = await browser.newPage()
  const UPWORK_URL = "https://www.upwork.com/"

  const upworkUrl = new URL(
    `https://www.upwork.com/nx/jobs/search/?q=web%20scraping%20ai&sort=recency&t=0`
  )

  // upworkUrl.searchParams.set("q", searchQuery)

  await page.evaluateOnNewDocument(
    () => localStorage.setItem("jobs_per_page", "1") // default is 10
  )

  // await page.setRequestInterception(true)
  page.on("request", async (req) => {
    if (req.url().startsWith(`${UPWORK_URL}nx/jobs/search/`)) {
      console.log(req.headers())
    }
  })

  // page.on("response", async (res) => {
  //   if (res.url().startsWith(`${UPWORK_URL}search/jobs/url`)) {
  //     // if (s) console.log(res.url())
  //   }
  // })

  // await page.setRequestInterception(true)
  // page.on("request", async (req) => {
  //   // if (req.url().startsWith(`https://www.walmart.com/blocked`)) {
  //   if (req.resourceType() === "script") {
  //     req.abort()
  //   } else req.continue()
  // })

  await page.goto(upworkUrl.href, {
    waitUntil: "networkidle2",
  })
  // browser.close()
}

// test().catch(console.error)

// axios
// .get(
fetch(
  "https://www.upwork.com/nx/jobs/search/details/~017c703c7808e4b3c3?q=web%20scraping%20ai&sort=recency&client_hires=0&pageTitle=Job%20Detail&_navType=slider&_modalInfo=%5B%7B%22navType%22%3A%22slider%22,%22title%22%3A%22Job%20Detail%22,%22modalId%22%3A%221695040841383%22%7D%5D",
  {
    headers: {
      // cookie:
      // "visitor_topnav_gql_token=oauth2v2_25d04353cdd6f52aee8747481e00c127; visitor_id=45.243.92.25.1695014769980000; country_code=EG; cookie_prefix=; cookie_domain=.upwork.com; __cflb=02DiuEXPXZVk436fJfSVuuwDqLqkhavJbwa2X8Lr1Q6m1; channel=other; device_view=full; umq=526; XSRF-TOKEN=c8e414a3682d0ee74b8ab6d6f7bff7d5; spt=15355447-6fb0-4c8a-849c-0946c993fb7f; _cq_duid=1.1695031861.S7o8xjGnBZ3wP01A; _cq_suid=1.1695031861.QwHJO4knUtV5ibSU; OptanonAlertBoxClosed=2023-09-18T10:12:57.303Z; _gcl_au=1.1.1625169767.1695034834; _zitok=c883e90e4f265000120c1695034838; upcSI=414cd9eb-efc9-4f6a-a2b2-968ec3802e77; _cfuvid=XTQR77EGveZBfK.2hSjE3UhQLtPeXHkEtQ8O2IYi_Iw-1695090119550-0-604800000; _upw_ses.5831=*; ftr_blst_1h=1695095593409; visitor_ui_gql_token_jobsearch=oauth2v2_5053f8cd666a3e55d51f56eb9a34f371; OptanonConsent=consentId=93123dd8-a877-4b43-a937-0a82e1541693&datestamp=Tue+Sep+19+2023+06%3A53%3A37+GMT%2B0300+(Eastern+European+Summer+Time)&version=202305.1.0&isGpcEnabled=1&hosts=&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A1%2CC0004%3A0&landingPath=NotLandingPage&interactionCount=0; _upw_id.5831=69e704b5-8092-49ac-8868-ef7b286d7c54.1695031860.4.1695095617.1695091859.cc45e4df-7161-4e4f-afbb-db04077d63eb.2ac762da-9335-4cc9-94b5-0f8e3b7f00c3.c1ac042a-6c63-450b-af29-78eaa5c07679.1695095593349.6; enabled_ff=!CI10270Air2Dot5QTAllocations,!TONB3476Air3Migration,!MP16400Air3Migration,!RMTAir3Hired,!air2Dot76Qt,!SSINavUser,OTBnrOn,TONB2256Air3Migration,air2Dot76,!CLOBSNAIR3,!pxFAA3,!RMTAir3Home,CI11132Air2Dot75,!RMTAir3Talent,!CI10857Air3Dot0,!JPAir3,!FLSAir3,CI9570Air2Dot5,i18nOn,!CI12577UniversalSearch; AWSALB=Q4yyeM2CcEZY2Y3CDyMWB49CkFjU+2UcsfQRJ83WpBAkNAQOrTZg85RfvAgkOQh5rMBGEo7XwiZXuK9+ZOFyDaPFzvHpBlXBD9BRHMRWSxRM9xL3H3bbQi+t7QEe; AWSALBCORS=Q4yyeM2CcEZY2Y3CDyMWB49CkFjU+2UcsfQRJ83WpBAkNAQOrTZg85RfvAgkOQh5rMBGEo7XwiZXuK9+ZOFyDaPFzvHpBlXBD9BRHMRWSxRM9xL3H3bbQi+t7QEe; forterToken=a8bdeb24b44f49aca6841562e2e2492d_1695095616689__UDF43-m4_14ck; __cf_bm=EgSloJWCJCM2X1ewcOOfy7qLBT9EKUvOUt7KNHa7L.8-1695095865-0-Aegln7iYoaosC7l5KOTtHeUAL9EyMc+j3WMXGFrMe1Zr4/ZokKKt1C3UkXHRjFYLvLXtUzrFAl1yEjSaOtJEw8s=",
      // "User-Agent": "PostmanRuntime/7.32.3",
      // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
      // "sec-ch-ua-platform": '"Windows"',
      // 'sec-ch-ua': '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"'
    },
    // referrerPolicy: "no-referrer",
    body: null,
    method: "GET",
    // credentials: "include",
  }
)
  .then((res) => res)
  .then(console.log)
  .catch(console.error)
